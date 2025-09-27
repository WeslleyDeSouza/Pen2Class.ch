import { Injectable, signal, computed } from '@angular/core';
import { ResourcesService, ResourceDto } from "@ui-lib/apiClient";
import { UserStoreService } from "../../../../common/store";

export interface ExamCreateRequest {
  name: string;
  description?: string;
  classroomId: string;
  userId: string;
  data?: Record<string, any>;
  configuration?: Record<string, any>;
}

export interface ExamUpdateRequest {
  name?: string;
  description?: string;
  data?: Record<string, any>;
  configuration?: Record<string, any>;
}

export interface ExamSummary {
  id: string;
  name: string;
  description?: string;
  classroomId: string;
  userId: string;
  configuration?: any;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamsByClassroom {
  [classroomId: string]: ExamSummary[];
}

// Legacy interface - keeping for backwards compatibility
export interface Exames extends ExamSummary {}

@Injectable({ providedIn: 'root' })
export class ExamsManagementFacade {
  private readonly type = "EXAM";
  private readonly typeResult = "EXAM_RESULT";

  // Reactive signals for state management
  private examsSignal = signal<ExamsByClassroom>({});
  private isLoadingSignal = signal<boolean>(false);

  // Public readonly signals
  exams = this.examsSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();

  // Computed values
  allExams = computed(() => Object.values(this.examsSignal()).flat());
  totalExamCount = computed(() => this.allExams().length);

  constructor(
    private resource: ResourcesService,
    private userStore: UserStoreService
  ) {}

  /**
   * Get all exams for a classroom
   */
  async getExams(classroomId: string): Promise<ExamSummary[]> {
    this.isLoadingSignal.set(true);

    try {
      const resources = await this.resource.resourceGetByClassroomAndType({
        classroomId: classroomId,
        type: this.type as any
      });

      const exams = resources.map(resource => this.mapResourceToExamSummary(resource));

      // Update the exams map
      const currentExams = this.examsSignal();
      const updatedExams = {
        ...currentExams,
        [classroomId]: exams
      };
      this.examsSignal.set(updatedExams);

      return exams;
    } catch (error) {
      console.error('Failed to get exams:', error);
      return [];
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get a single exam by ID
   */
  async getExam(examId: string): Promise<ExamSummary | null> {
    try {
      const resource = await this.resource.resourceGetById({ id: examId });
      return this.mapResourceToExamSummary(resource);
    } catch (error) {
      console.error('Failed to get exam:', error);
      return null;
    }
  }

  /**
   * Create a new exam
   */
  async createExam(request: ExamCreateRequest): Promise<ExamSummary | null> {
    this.isLoadingSignal.set(true);

    try {
      const resource = await this.resource.resourceCreate({
        body: {
          classroomId: request.classroomId,
          userId: request.userId,
          type: this.type as any,
          data: {
            name: request.name,
            description: request.description,
            ...request.data
          }
        }
      });

      const examSummary = this.mapResourceToExamSummary(resource);

      // Refresh exams for this classroom
      await this.getExams(request.classroomId);

      return examSummary;
    } catch (error) {
      console.error('Failed to create exam:', error);
      return null;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Update an existing exam
   */
  async updateExam(examId: string, updates: ExamUpdateRequest): Promise<ExamSummary | null> {
    this.isLoadingSignal.set(true);

    try {

      const resource = await this.resource.resourceUpdate({
        id: examId,
        body: {
          ...updates,
          type: this.type as any,
        }
      });

      const examSummary = this.mapResourceToExamSummary(resource);

      // Refresh exams for this classroom
      return examSummary;
    } catch (error) {
      console.error('Failed to update exam:', error);
      return null;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Delete an exam
   */
  async deleteExam(examId: string): Promise<boolean> {
    this.isLoadingSignal.set(true);

    try {
      // Get the exam to know which classroom to refresh
      const exam = await this.getExam(examId);
      if (!exam) {
        throw new Error('Exam not found');
      }

      await this.resource.resourceDelete({ id: examId });

      // Refresh exams for this classroom
      await this.getExams(exam.classroomId);

      return true;
    } catch (error) {
      console.error('Failed to delete exam:', error);
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get exams for a specific classroom from local state
   */
  getExamsForClassroom(classroomId: string): ExamSummary[] {
    return this.examsSignal()[classroomId] || [];
  }

  /**
   * Get all exams across all classrooms from local state
   */
  getAllExams(): ExamSummary[] {
    return this.allExams();
  }

  /**
   * Get total exam count from local state
   */
  getTotalExamCount(): number {
    return this.totalExamCount();
  }

  /**
   * Clear exams for a classroom from local state
   */
  clearExamsForClassroom(classroomId: string): void {
    const currentExams = this.examsSignal();
    const updatedExams = { ...currentExams };
    delete updatedExams[classroomId];
    this.examsSignal.set(updatedExams);
  }

  /**
   * Load exams for multiple classrooms
   */
  async loadExamsForClassrooms(classroomIds: string[]): Promise<ExamsByClassroom> {
    this.isLoadingSignal.set(true);

    try {
      const updatedExams: ExamsByClassroom = { ...this.examsSignal() };

      const promises = classroomIds.map(async (classroomId) => {
        try {
          const exams = await this.getExams(classroomId);
          updatedExams[classroomId] = exams;
        } catch (error) {
          console.error(`Failed to load exams for classroom ${classroomId}:`, error);
          updatedExams[classroomId] = updatedExams[classroomId] || [];
        }
      });

      await Promise.allSettled(promises);
      this.examsSignal.set(updatedExams);

      return updatedExams;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }



  submitResult(classroomId:string,data:any){
   return  this.resource.resourceCreate({
      body: {
        classroomId: classroomId,
        userId: this.userStore.getCurrentUser()?.id as string,
        type: this.typeResult as any,
        data: Object.assign(data, {
          displayName: this.userStore.getCurrentUser()?.displayName || '',
        })
      }
    })
  }

  getUsersSubmitedResult(classroomId:string){
    return this.resource.resourceGetByUserClassroomAndType({
      classroomId: classroomId,
      userId: this.userStore.getCurrentUser()?.id as string,
      type: this.typeResult as any,
    }).then(res=>{
      return res.map(r=> Object.assign(r,r.data || {}))
    })
  }

  /**
   * Get all exam results for a specific exam
   */
  async getExamResults(examId: string, classroomId: string): Promise<any[]> {
    try {
      const results:any[] = await this.resource.resourceGetByClassroomAndType({
        classroomId: classroomId,
        type: this.typeResult as any
      });


      // Filter results for this specific exam and transform data
      return results
        .filter(result => result.data?.examId === examId)
        .map(result => {
          const data = result.data || {};
          const score = data.score || 0;
          const correctAnswers = data.correctAnswers || 0;
          const totalQuestions = data.totalQuestions || 1;
          const percentage = Math.round((correctAnswers / totalQuestions) * 100);

          return {
            id: result.id!,
            userId: result.userId,
            examId: examId,
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions,
            percentage: percentage,
            userInfo: {
              name: data.userInfo?.name || data.displayName || result.userId,
              email: data.userInfo?.email || ''
            },
            submittedAt: result.createdAt
          };
        });
    } catch (error) {
      console.error('Failed to get exam results:', error);
      return [];
    }
  }

  /**
   * Delete an exam result
   */
  async deleteExamResult(resultId: string): Promise<boolean> {
    try {
      await this.resource.resourceDelete({ id: resultId });
      return true;
    } catch (error) {
      console.error('Failed to delete exam result:', error);
      return false;
    }
  }

  /**
   * Map ResourceDto to ExamSummary
   */
  private mapResourceToExamSummary(resource: ResourceDto): ExamSummary {
    const data = resource.data || {};

    return {
      id: resource.id!,
      //@ts-ignore
      name: data['name'] || '',
      //@ts-ignore
      description: data['description'],
      classroomId: resource.classroomId!,
      userId: resource.userId!,
      configuration: resource.configuration!,
      data: data,
      createdAt: new Date(resource.createdAt!),
      updatedAt: new Date(resource.updatedAt!)
    };
  }
}
