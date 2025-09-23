import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClassroomManagementFacade, ClassroomSummary } from './facades/classroom-management.facade';
import { LessonManagementFacade, LessonSummary } from './facades/lesson-management.facade';
import {ChannelService} from "../../../common";
import {PeerUserStoreService} from "../../../common/services/peer.service";
import { RouteConstants} from "../../../app/route.constants";

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
        @if (lesson) { <div class="text-sm text-gray-500">Updated {{ lesson?.updatedAt | date:'short' }}</div> }
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Sidebar: Members -->
      <aside class="lg:col-span-3">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-800">Members</h3>
            <span class="text-xs text-gray-500">{{ members.length }}</span>
          </div>
          <ul class="divide-y divide-gray-100">
            @for (m of members; track m.userId) {
              <li (click)="onMemberSelect(m)"  class="py-3 flex items-center">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-3">
                  <span class="text-xs font-medium">{{ ((m.user?.displayName || m.userId || 'U') +'') | slice:0:2 | uppercase }}</span>
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ m.user?.displayName || m.userId }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ m.role || 'member' }}</div>
                </div>
              </li>
            }

            @if (!members.length) { <li class="py-6 text-center text-sm text-gray-500">No members yet</li> }
          </ul>
        </div>
      </aside>

      <!-- Main area -->
      <main class="lg:col-span-9">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow p-4 min-h-[400px]">
          <router-outlet></router-outlet>
          @if (!hasChildContent) {
            <div class="text-center py-12 text-gray-500">
              Select a Member to begin.
            </div>
          }
        </div>
      </main>
    </div>

  `
})
export class AdminClassRoomLessonComponent implements OnInit, OnDestroy {
  classroom: ClassroomSummary | null = null;
  lesson: LessonSummary | null = null;
  members: any[] = [];
  hasChildContent = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private classroomFacade: ClassroomManagementFacade,
    private lessonFacade: LessonManagementFacade,
    private channelService: ChannelService,
    private userStore: PeerUserStoreService,
  ) {}

  async ngOnInit() {
    // track router outlet activation
    const sub = this.router.events.subscribe(() => {
      // best-effort: if a child activates, hide placeholder
      this.hasChildContent = true;
    });
    this.subscriptions.push(sub);

    await this.loadContext();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
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
       this.router.navigate(['/admin/dashboard']);
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
    this.router.navigate(['/admin/classroom', this.classroom?.id, 'lesson', this.lesson?.id, RouteConstants.Paths.user, member.userId]);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
