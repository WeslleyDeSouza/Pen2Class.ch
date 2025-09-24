import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClassroomManagementFacade, ClassroomSummary } from './facades/classroom-management.facade';
import { LessonManagementFacade, LessonSummary } from './facades/lesson-management.facade';
import {ChannelService} from "../../../common";
import {PeerUserStoreService, PeerService} from "../../../common/services/peer.service";
import { RouteConstants} from "../../../app/route.constants";
import { PeerBusService } from "../../../common/services/peer-bus.service";
import { LeaveEvent, JoinEvent, ObjectEvent } from '@ui-lib/apiClient';;

@Component({
  selector: 'app-admin-class-room-lesson',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DatePipe],
  template: `
    <!-- Topbar -->
    <div class="bg-white/70 backdrop-blur-sm border-b border-white/40 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button (click)="goBack()" class="inline-flex items-center px-3 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          <div>
            <div class="text-sm text-gray-500">Admin • Classroom Lesson</div>
            <div class="text-xl font-semibold text-gray-900">
              {{ classroom?.name || 'Classroom' }}
              <span class="text-gray-400">/</span>
              <span class="text-blue-600">{{ lesson?.name || 'Lesson' }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button
            (click)="toggleFullscreen()"
            class="inline-flex items-center px-3 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors"
            [title]="isFullscreen() ? 'Exit Fullscreen' : 'Enter Fullscreen'"
          >
            @if (isFullscreen()) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"></path>
              </svg>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
              </svg>
            }
          </button>
          @if (lesson) { <div class="text-sm text-gray-500">Updated {{ lesson?.updatedAt | date:'short' }}</div> }
        </div>
      </div>
    </div>

    <!-- Content -->
    <div
      class="mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 gap-6 transition-all duration-300"
      [ngClass]="isFullscreen() ? 'max-w-full lg:grid-cols-1' : 'max-w-7xl lg:grid-cols-12'"
    >
      <!-- Sidebar: Members -->
      <aside
        class="transition-all duration-300"
        [ngClass]="isFullscreen() ? 'hidden' : 'lg:col-span-3'"
      >
        <div (click)="onMemberSelect({userId:currentUser?.id})" class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-800">{{((currentUser?.displayName  || 'Self')) }}</h3>
            <small>Open your own Editor > </small>
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow mt-2 p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-800">Members</h3>
            <span class="text-xs text-gray-500">{{ members.length }}</span>
          </div>
          <ul class="divide-y divide-gray-100">
            @for (m of members; track m.userId) {
              <li (click)="onMemberSelect(m)"  class="py-3 flex items-center">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-3">
                  <span class="text-xs font-medium">{{ ((m?.displayName || m.userId || 'U') +'') | slice:0:2 | uppercase }}</span>
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ m?.displayName || m.userId }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ m.role || 'member' }}</div>
                </div>
              </li>
            }

            @if (!members.length) { <li class="py-6 text-center text-sm text-gray-500">No members yet</li> }
          </ul>
        </div>
      </aside>

      <!-- Main area -->
      <main
        class="transition-all duration-300"
        [ngClass]="isFullscreen() ? 'col-span-1' : 'lg:col-span-9'"
      >
        <div
          id="admin-class-room-content"
          class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow p-4 transition-all duration-300"
          [ngClass]="isFullscreen() ? 'min-h-screen' : 'min-h-[400px]'"
        >
          <router-outlet></router-outlet>
          @if (!hasChildContent) {
            <div class="text-center py-12 text-gray-500">
              Select a Member to begin or your own Editor to start writing.
            </div>
          }
        </div>
      </main>
    </div>`
})
export class AdminClassRoomLessonComponent implements OnInit, OnDestroy {
  classroom: ClassroomSummary | null = null;
  lesson: LessonSummary | null = null;
  members: any[] = [];
  hasChildContent = false;
  isFullscreen = signal(false);

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private classroomFacade: ClassroomManagementFacade,
    private lessonFacade: LessonManagementFacade,
    private channelService: ChannelService,
    private userStore: PeerUserStoreService,
    private eventBus: PeerBusService,
  ) {}

  get currentUser(){
    return this.userStore.getCurrentUser();
  }

  async ngOnInit() {
    // track router outlet activation
    const sub = this.router.events.subscribe(() => {
      // best-effort: if a child activates, hide placeholder
      this.hasChildContent = true;
    });
    this.subscriptions.push(sub);

    await this.loadContext();

    // Setup realtime listeners for channel membership changes
    this.setupRealtimeListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private setupRealtimeListeners() {
    const sub = this.eventBus.on<any>('channelMessage')
      .subscribe((detail) => {
      try {
        // Expect structure like { type: 'channel_message', channelId, payload: { event: 'member_joined', ... } }
        const isChannelMsg = detail?.type === 'channel_message';
        const channelId = detail?.channelId || detail?.payload?.channelId;
        const eventName = detail?.payload?.event || detail?.action || detail?.event;
        if (!isChannelMsg || !channelId) {
          return;
        }
        // Only react if message belongs to this classroom
        const currentClassId = this.classroom?.id || this.userStore.selectedClassId();
        if (!currentClassId || channelId !== currentClassId) {
          return;
        }

        /**
         * LeaveEvent, JoinEvent, ObjectEvent
         **/

        // React to member join or leave events
        const joinLike = ['member_joined', 'member-joined', 'user_joined', 'joined'];
        const leaveLike = ['member_left', 'member-left', 'user_left', 'left'];
        if (eventName && (joinLike.includes(eventName) || leaveLike.includes(eventName))) {
          this.reloadMembers();
        }
      } catch (err) {
        console.warn('Failed to handle channelMessage event', err);
      }
    });
    this.subscriptions.push(sub);
  }

  private async reloadMembers() {
    const classId = this.classroom?.id || this.userStore.selectedClassId();
    if (!classId) return;
    try {
      const updated = await this.channelService.getChannelMembers(classId);
      this.members = updated as any[];
    } catch (e) {
      console.error('Failed to reload members', e);
    }
  }

  async loadContext() {
    // Ensure class and lesson context exist in the user store; if missing, get from router params
    let classId = this.userStore.selectedClassId();
    let lessonId = this.userStore.selectedLessonId();

    if (!classId || !lessonId) {
      // Read params from the current route (lesson level) and its parent (classroom level)
      const lessonFromRoute = this.route.snapshot.paramMap.get(RouteConstants.Params.lessonId) || undefined;
      const classFromRoute = this.route.parent?.snapshot.paramMap.get(RouteConstants.Params.classRoomId)
        || this.route.snapshot.paramMap.get(RouteConstants.Params.classRoomId)
        || undefined;

      if (!classId && classFromRoute) {
        classId = classFromRoute;
        this.userStore.selectedClassId.set(classFromRoute);
      }
      if (!lessonId && lessonFromRoute) {
        lessonId = lessonFromRoute;
        this.userStore.selectedLessonId.set(lessonFromRoute);
      }
    }

    if (!classId || !lessonId) {
      // Still missing context; keep UI minimal or navigate back if desired
        console.log("Missing context");
       this.router.navigate(['/', RouteConstants.Paths.admin, RouteConstants.Paths.dashboard]);
      return;
    }

    // Fetch summaries
    this.classroom = await this.classroomFacade.getClassroom(classId);
    this.lesson = await this.lessonFacade.getLesson(classId, lessonId);

    // Load members of the classroom
    try {
      this.members = await this.channelService.getChannelMembers(classId) as any[];
    } catch (e) {
      console.error('Failed to load members', e);
      this.members = [];
    }
  }

  onMemberSelect(member: any) {
    // navigate to member profile
    this.router.navigate(['/', RouteConstants.Paths.admin, RouteConstants.Paths.classroom, this.classroom?.id, RouteConstants.Paths.lesson, this.lesson?.id, RouteConstants.Paths.user, member.userId]);
  }

  toggleFullscreen() {
    this.isFullscreen.set(!this.isFullscreen());
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
