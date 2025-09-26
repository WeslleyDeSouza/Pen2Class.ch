import { Injectable, signal, computed } from '@angular/core';
import { ClassroomService } from '../../../../common/services/classroom.service';
import { UserStoreService } from '../../../../common/store';
import { StudentClassroom } from '../components/student-class-card.component';

export interface StudentStats {
  registeredClasses: number;
  activeLessons: number;
  completed: number;
  exams: number;
}

@Injectable({ providedIn: 'root' })
export class StudentClassroomFacade {
  private enrolledClassroomsSignal = signal<StudentClassroom[]>([]);
  private isLoadingSignal = signal<boolean>(false);

  // Public readonly signals
  enrolledClassrooms = this.enrolledClassroomsSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();

  // Computed values
  stats = computed(() => {
    const classes = this.enrolledClassroomsSignal();
    const activeLessons = classes
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.totalLessons - c.completedLessons), 0);

    const completedLessons = classes
      .reduce((sum, c) => sum + c.completedLessons, 0);

    return {
      registeredClasses: classes.length,
      activeLessons,
      completed: completedLessons,
      exams: 2 // This would come from a separate exams service
    };
  });

  activeClasses = computed(() => this.enrolledClassroomsSignal().filter(c => c.status === 'active'));
  completedClasses = computed(() => this.enrolledClassroomsSignal().filter(c => c.status === 'completed'));

  constructor(
    private classroomService: ClassroomService,
    private userStore: UserStoreService
  ) {}

  /**
   * Load all enrolled classrooms for the current student
   */
  async loadEnrolledClassrooms(): Promise<StudentClassroom[]> {
    this.isLoadingSignal.set(true);

    try {
      const currentUser = this.userStore.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      // This would typically fetch from a student-specific endpoint
      // For now, we'll use mock data that matches the design
      const mockClassrooms: StudentClassroom[] = [
        {
          id: '1',
          name: 'Web Development Basics',
          description: 'Learn the fundamentals of web development',
          teacherName: 'Prof. Johnson',
          progress: 75,
          totalLessons: 8,
          completedLessons: 6,
          status: 'active',
          technologies: ['HTML', 'CSS', 'JavaScript'],
          nextLesson: {
            title: 'CSS Flexbox Layout',
            scheduledDate: 'Today, 2:00 PM'
          }
        },
        {
          id: '2',
          name: 'Advanced JavaScript',
          description: 'Master advanced JavaScript concepts',
          teacherName: 'Dr. Smith',
          progress: 45,
          totalLessons: 12,
          completedLessons: 5,
          status: 'active',
          technologies: ['JavaScript', 'React'],
          nextLesson: {
            title: 'Async/Await Patterns',
            scheduledDate: 'Tomorrow, 10:00 AM'
          }
        },
        {
          id: '3',
          name: 'CSS Layouts & Design',
          description: 'Create beautiful layouts with CSS',
          teacherName: 'Ms. Davis',
          progress: 100,
          totalLessons: 6,
          completedLessons: 6,
          status: 'completed',
          technologies: ['CSS', 'HTML']
        }
      ];

      this.enrolledClassroomsSignal.set(mockClassrooms);
      return mockClassrooms;
    } catch (error) {
      console.error('Failed to load enrolled classrooms:', error);
      return [];
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Join a classroom by code
   */
  async joinClassroomByCode(code: string, displayName?: string): Promise<boolean> {
    this.isLoadingSignal.set(true);

    try {
      const currentUser = this.userStore.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const result = await this.classroomService.joinClassroomByCode(
        code,
        currentUser.id,
        displayName || currentUser.displayName || currentUser.id
      );

      if (result) {
        // Reload enrolled classrooms after joining
        await this.loadEnrolledClassrooms();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to join classroom:', error);
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get a specific classroom by ID
   */
  async getClassroom(classroomId: string): Promise<StudentClassroom | null> {
    const classrooms = this.enrolledClassroomsSignal();
    return classrooms.find(c => c.id === classroomId) || null;
  }

  /**
   * Update progress for a lesson (this would typically come from lesson completion)
   */
  updateClassroomProgress(classroomId: string, completedLessons: number): void {
    const classrooms = this.enrolledClassroomsSignal();
    const updatedClassrooms = classrooms.map(classroom => {
      if (classroom.id === classroomId) {
        const progress = Math.round((completedLessons / classroom.totalLessons) * 100);
        const status = progress === 100 ? 'completed' : 'active';

        return {
          ...classroom,
          completedLessons,
          progress,
          status: status as 'active' | 'completed'
        };
      }
      return classroom;
    });

    this.enrolledClassroomsSignal.set(updatedClassrooms);
  }

  /**
   * Refresh the enrolled classrooms list
   */
  async refresh(): Promise<void> {
    await this.loadEnrolledClassrooms();
  }
}