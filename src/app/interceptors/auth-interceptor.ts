import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError, Observable } from 'rxjs';
import { Auth } from '../services/auth';

// Module-level state shared across all requests going through this interceptor,
// so concurrent 401s only trigger ONE refresh call, not one per failed request.
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const auth = inject(Auth);
  const router = inject(Router);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // Never try to "refresh" on the login/refresh calls themselves — avoids infinite loops
  const isAuthEndpoint =
    req.url.includes('/Auth/login') || req.url.includes('/Auth/refresh-token');

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthEndpoint) {
        return throwError(() => err);
      }
      return handle401(req, next, auth, router);
    })
  );
};

function handle401(req: HttpRequest<unknown>, next: HttpHandlerFn, auth: Auth, router: Router): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshedToken$.next(null);

    return auth.refreshToken().pipe(
      switchMap((res: any) => {
        isRefreshing = false;
        const role = localStorage.getItem('role') ?? '';
        auth.saveToken(res.token, role, res.refreshToken);
        refreshedToken$.next(res.token);

        return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.token}` } }));
      }),
      catchError((refreshErr) => {
        // Refresh token itself is invalid/expired — force re-login
        isRefreshing = false;
        auth.logout();
        router.navigate(['/login']);
        return throwError(() => refreshErr);
      })
    );
  }

  // A refresh triggered by another request is already in flight — wait for it,
  // then retry this request with the newly issued token.
  return refreshedToken$.pipe(
    filter((t): t is string => t !== null),
    take(1),
    switchMap((newToken) =>
      next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))
    )
  );
}
