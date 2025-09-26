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

      // Fetch classrooms from the service
      const classrooms = await this.classroomService.getClassroomsFromUser(currentUser.id);

      // Map classroom data to student classroom format
      const studentClassrooms: StudentClassroom[] = classrooms.map(classroom => this.mapToStudentClassroom(classroom));

      this.enrolledClassroomsSignal.set(studentClassrooms);
      return studentClassrooms;
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

  /**
   * Map classroom data to student classroom format
   */
  private mapToStudentClassroom(classroom: any): StudentClassroom {
    // Extract technologies from configuration or use defaults
    const enabledTechnologies = classroom.configuration?.enabledTechnologies || {};
    const technologies: string[] = [];

    if (enabledTechnologies.html !== false) technologies.push('HTML');
    if (enabledTechnologies.css !== false) technologies.push('CSS');
    if (enabledTechnologies.javascript !== false) technologies.push('JavaScript');

    // For now, use mock progress data - in a real app this would come from user progress tracking
    const mockProgress = Math.floor(Math.random() * 100);
    const mockTotalLessons = Math.floor(Math.random() * 12) + 4; // 4-15 lessons
    const mockCompletedLessons = Math.floor((mockProgress / 100) * mockTotalLessons);
    const isCompleted = mockProgress === 100;

    return {
      id: classroom.id,
      name: classroom.name,
      description: classroom.description,
      teacherName: classroom.createdBy || 'Instructor', // This would ideally come from user data
      lessons:classroom.lessons,
      progress: mockProgress,
      totalLessons: mockTotalLessons,
      completedLessons: mockCompletedLessons,
      status: isCompleted ? 'completed' : 'active',
      technologies: technologies.length > 0 ? technologies : ['HTML', 'CSS', 'JavaScript'],
      nextLesson: !isCompleted ? {
        title: 'Next Lesson',
        scheduledDate: 'Available now'
      } : undefined
    };
  }
}
