import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CustomerService } from '../../services/customer-service';
import { RequestService } from '../../services/request';
import { NotificationService } from '../../services/notification-service';
import { WalletService, WalletTransaction } from '../../services/wallet-service';
import { ReviewService, ReviewResponse } from '../../services/review-service';
import { CustomerProfileDetails } from '../../models/customer-model';
import { AppNotification } from '../../models/notification-model';
import { ServiceRequest } from '../../models/request.model';

interface ActiveRequest {
  id: number;
  title: string;
  technicianName: string | null;
  status: string;
}

/** Where a piece of "Recent Activity" came from — drives which icon/colors it gets. */
type ActivitySource =
  | 'notification'
  | 'wallet_deposit'
  | 'wallet_withdraw'
  | 'request_completed'
  | 'review';

interface ActivityItem {
  id: string;
  source: ActivitySource;
  title: string;
  timestamp: number; // epoch ms, used for sorting — never shown directly
  time: string;       // human-readable Arabic relative time
  icon: string;
  iconBg: string;
  iconColor: string;
}

/** How many completed requests we're willing to check for an attached review (best-effort, small N). */
const REVIEW_LOOKUP_LIMIT = 3;
/** How many merged activity items to show in the widget. */
const RECENT_ACTIVITY_LIMIT = 6;

@Component({
  selector: 'app-customer-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-dashboard.html',
  styleUrl: `./customer-dashboard.css`,
})
export class CustomerDashboard implements OnInit {
  private customerService = inject(CustomerService);
  private requestService = inject(RequestService);
  private notificationService = inject(NotificationService);
  private walletService = inject(WalletService);
  private reviewService = inject(ReviewService);

  userName = localStorage.getItem('userName') ?? 'عميل';

  // stats
  activeRequestsCount = 0;
  completedRequestsCount = 0;
  walletBalance = 0;
  newNotificationsCount = 0;

  // active requests (top few)
  activeRequests: ActiveRequest[] = [];

  // recent activity, merged from notifications + wallet + requests + reviews
  recentActivity: ActivityItem[] = [];
  activityLoading = true;
  activityError = false;

  // ui state
  isLoading = true;
  loadError = false;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.loadError = false;
    this.activityLoading = true;
    this.activityError = false;

    forkJoin({
      profile: this.customerService.getMyProfile().pipe(catchError(() => of(null))),
      requests: this.requestService.getMyRequests().pipe(
        map((r: any) => (Array.isArray(r) ? (r as ServiceRequest[]) : [])),
        catchError(() => of([] as ServiceRequest[]))
      ),
      wallet: this.walletService.getWallet().pipe(catchError(() => of(null))),
      notifications: this.notificationService
        .fetchNotifications()
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ profile, requests, wallet, notifications }) => {
        this.applyProfile(profile);
        this.applyRequests(requests ?? []);
        this.walletBalance = this.walletService.extractBalance(wallet);
        this.isLoading = false;

        // notifications failing outright is treated as a real error for the widget,
        // since it's the primary activity source; wallet/requests/reviews degrade silently.
        if (notifications === null) {
          this.activityLoading = false;
          this.activityError = true;
          this.recentActivity = [];
          return;
        }

        this.newNotificationsCount = notifications.filter((n) => !n.isRead).length;
        this.buildRecentActivity(notifications, requests ?? [], wallet);
      },
      error: () => {
        this.isLoading = false;
        this.loadError = true;
        this.activityLoading = false;
        this.activityError = true;
      },
    });
  }

  private applyProfile(profile: CustomerProfileDetails | null): void {
    if (!profile) return;
    this.userName = profile.name || this.userName;
    localStorage.setItem('userName', this.userName);
  }

  private applyRequests(requests: ServiceRequest[]): void {
    const list = Array.isArray(requests) ? requests : [];

    const normalize = (status: any): string =>
      (status ?? '').toString().toLowerCase().replace(/_/g, '');

    const activeStatuses = ['open', 'assigned', 'inprogress'];

    const active = list.filter((r) => activeStatuses.includes(normalize(r.status)));
    const completed = list.filter((r) => normalize(r.status) === 'completed');

    this.activeRequestsCount = active.length;
    this.completedRequestsCount = completed.length;

    this.activeRequests = active.slice(0, 4).map((r) => ({
      id: r.id,
      title: r.title,
      technicianName: (r as any).technicianName ?? null,
      status: normalize(r.status),
    }));
  }

  /**
   * Merges every real, timestamped signal we already fetch (or can cheaply fetch)
   * from the backend into a single "Recent Activity" feed: notifications, wallet
   * transactions, completed requests, and reviews on those completed requests.
   * No mock data — items with no usable timestamp are simply left out.
   */
  private buildRecentActivity(
    notifications: AppNotification[],
    requests: ServiceRequest[],
    wallet: any
  ): void {
    const notificationItems = this.notificationsToActivity(notifications);
    const walletItems = this.walletToActivity(this.walletService.extractTransactions(wallet));

    const normalize = (status: any): string =>
      (status ?? '').toString().toLowerCase().replace(/_/g, '');

    // Most-recently-created completed requests first (id is sequential/auto-increment).
    const recentCompleted = requests
      .filter((r) => normalize(r.status) === 'completed')
      .sort((a, b) => b.id - a.id)
      .slice(0, REVIEW_LOOKUP_LIMIT);

    if (recentCompleted.length === 0) {
      this.finishActivity([...notificationItems, ...walletItems]);
      return;
    }

    const reviewLookups: Observable<{ req: ServiceRequest; review: ReviewResponse | null }>[] =
      recentCompleted.map((req) =>
        this.reviewService.getReviewByRequest(req.id).pipe(
          map((review) => ({ req, review })),
          catchError(() => of({ req, review: null as ReviewResponse | null }))
        )
      );

    forkJoin(reviewLookups).subscribe({
      next: (results) => {
        const requestItems = this.completedRequestsToActivity(
          recentCompleted,
          results.filter((r) => !!r.review).map((r) => r.req.id)
        );
        const reviewItems = this.reviewsToActivity(results);

        this.finishActivity([
          ...notificationItems,
          ...walletItems,
          ...requestItems,
          ...reviewItems,
        ]);
      },
      error: () => {
        // Reviews are a "nice to have" enrichment — fall back to what we already have.
        const requestItems = this.completedRequestsToActivity(recentCompleted, []);
        this.finishActivity([...notificationItems, ...walletItems, ...requestItems]);
      },
    });
  }

  private finishActivity(items: ActivityItem[]): void {
    this.recentActivity = items
      .filter((item) => Number.isFinite(item.timestamp) && item.timestamp > 0)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, RECENT_ACTIVITY_LIMIT);
    this.activityLoading = false;
  }

  // ── source → ActivityItem mappers ──────────────────────────────────────

  private notificationsToActivity(notifications: AppNotification[]): ActivityItem[] {
    return (Array.isArray(notifications) ? notifications : []).map((n) => {
      const ts = new Date(n.sentAt).getTime();
      return {
        id: `notif-${n.id}`,
        source: 'notification' as const,
        title: n.title || n.body,
        timestamp: ts,
        time: this.timeAgo(n.sentAt),
        icon: this.iconFor(n.type),
        iconBg: this.bubbleBg(n.type),
        iconColor: this.iconColor(n.type),
      };
    });
  }

  private walletToActivity(transactions: WalletTransaction[]): ActivityItem[] {
    return (transactions ?? []).map((t) => {
      const isWithdraw = t.type?.toLowerCase() === 'withdraw' || t.type?.toLowerCase() === 'withdrawal';
      const amountLabel = `${t.amount} ج.م`;
      return {
        id: `wallet-${t.id}`,
        source: (isWithdraw ? 'wallet_withdraw' : 'wallet_deposit') as ActivitySource,
        title: isWithdraw
          ? `تم سحب ${amountLabel} من المحفظة`
          : (t.description || `تم شحن المحفظة بمبلغ ${amountLabel}`),
        timestamp: new Date(t.createdOn).getTime(),
        time: this.timeAgo(t.createdOn),
        icon: isWithdraw ? 'fa-solid fa-arrow-up-from-bracket' : 'fa-solid fa-wallet',
        iconBg: isWithdraw ? '#fdeaea' : '#e8f3ff',
        iconColor: isWithdraw ? '#dc3545' : '#1787e0',
      };
    });
  }

  /**
   * A completed request's `scheduledAt` is the closest real timestamp we have to
   * "when the job happened" (the API doesn't expose createdAt/completedAt), so we
   * use it to place the completion in the feed. Requests that already produced a
   * review are skipped here since the review item itself represents that activity.
   */
  private completedRequestsToActivity(
    requests: ServiceRequest[],
    reviewedRequestIds: number[]
  ): ActivityItem[] {
    return requests
      .filter((r) => !reviewedRequestIds.includes(r.id))
      .map((r) => ({
        id: `req-${r.id}`,
        source: 'request_completed' as const,
        title: `اكتمل الطلب: ${r.title}`,
        timestamp: new Date(r.scheduledAt).getTime(),
        time: this.timeAgo(r.scheduledAt),
        icon: 'fa-solid fa-circle-check',
        iconBg: '#e1f5ee',
        iconColor: '#10b981',
      }));
  }

  private reviewsToActivity(
    results: { req: ServiceRequest; review: ReviewResponse | null }[]
  ): ActivityItem[] {
    return results
      .filter((r) => !!r.review && !!r.review!.createdAt)
      .map(({ req, review }) => {
        const rating = review!.overallRating ?? review!.overallScore ?? review!.rating ?? null;
        const ratingLabel = rating != null ? ` (${rating}/5)` : '';
        return {
          id: `review-${review!.id}`,
          source: 'review' as const,
          title: `قيّمت طلب "${req.title}"${ratingLabel}`,
          timestamp: new Date(review!.createdAt!).getTime(),
          time: this.timeAgo(review!.createdAt),
          icon: 'fa-solid fa-star',
          iconBg: '#fff4e0',
          iconColor: '#b8860b',
        };
      });
  }

  /** Same icon/color convention used on the Notifications page, for consistency */
  private iconFor(type: string): string {
    switch (type) {
      case 'new_bid':      return 'fa-solid fa-coins';
      case 'bid_accepted': return 'fa-solid fa-circle-check';
      case 'payment':      return 'fa-solid fa-credit-card';
      case 'chat':         return 'fa-regular fa-message';
      case 'escrow':       return 'fa-solid fa-shield-halved';
      case 'emergency':    return 'fa-solid fa-triangle-exclamation';
      case 'promo':        return 'fa-solid fa-gift';
      case 'system':       return 'fa-solid fa-gear';
      case 'verification': return 'fa-solid fa-id-card';
      default:             return 'fa-regular fa-bell';
    }
  }

  private bubbleBg(type: string): string {
    switch (type) {
      case 'bid_accepted': return '#e8f5e9';
      case 'payment':      return '#e7f1ff';
      case 'new_bid':      return '#e7f1ff';
      case 'emergency':    return '#fdeaea';
      case 'verification': return '#fff4e0';
      default:             return '#f1f3f5';
    }
  }

  private iconColor(type: string): string {
    switch (type) {
      case 'bid_accepted': return '#2e7d32';
      case 'payment':      return '#0d6efd';
      case 'new_bid':      return '#0d6efd';
      case 'emergency':    return '#dc3545';
      case 'verification': return '#b8860b';
      default:             return '#6c757d';
    }
  }

  /** Arabic relative time, e.g. "منذ ساعتين" / "أمس" / "منذ 3 أيام" */
  private timeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const time = new Date(dateStr).getTime();
    if (!Number.isFinite(time)) return '';

    const diffMs = Date.now() - time;
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (diffMs < 0) return 'قريبًا';
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours === 1) return 'منذ ساعة';
    if (hours < 24) return `منذ ${hours} ساعات`;
    if (days === 1) return 'أمس';
    return `منذ ${days} أيام`;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      open: 'badge-open',
      assigned: 'badge-confirmed',
      inprogress: 'badge-progress',
      completed: 'badge-done',
      cancelled: 'badge-cancelled',
    };
    return map[status] ?? 'badge-open';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      open: 'مفتوح',
      assigned: 'تم اختيار الفني',
      inprogress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    return map[status] ?? status;
  }
}
