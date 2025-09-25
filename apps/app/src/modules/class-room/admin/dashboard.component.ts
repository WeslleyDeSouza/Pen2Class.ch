import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClassroomManagementFacade, ClassroomSummary } from './facades/classroom-management.facade';
import { LessonManagementFacade, LessonSummary } from './facades/lesson-management.facade';
import {Router} from "@angular/router";
import { RouteConstants } from '../../../app/route.constants';
import {UserStoreService} from "../../../common/store";
import {UserDto} from "@ui-lib/apiClient";

interface CreateChannelForm {
  name: string;
  description: string;
}

interface CreateLessonForm {
  name: string;
  description: string;
  channelId: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <!-- Header -->
      <div class="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div class="w-full px-4 sm:px-6 lg:px-8">
          <div class="max-w-7xl mx-auto py-6 lg:py-8">
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              <div class="flex items-center space-x-4">
                <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 01-2 2H9z"></path>
                  </svg>
                </div>
                <div>
                  <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p class="text-gray-600 text-sm lg:text-base">Manage your HTML coding classrooms and lessons</p>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                @if (currentUser(); as user) {
                  <div class="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30 shadow-sm">
                    <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-gray-700 font-medium text-sm">Welcome back!</p>
                      <p class="text-gray-600 text-xs">{{user.displayName}}</p>
                    </div>
                  </div>
                }

                <button
                  (click)="showActivityLog = true"
                  class="bg-white/20 hover:bg-white/30 text-gray-700 p-3 rounded-xl transition-colors border border-white/30 shadow-sm">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div class="max-w-7xl mx-auto">

          <!-- Top Stats Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total Classrooms</p>
                  <p class="text-3xl font-bold text-blue-600">{{classroomFacade.classrooms().length}}</p>
                </div>
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total Lessons</p>
                  <p class="text-3xl font-bold text-green-600">{{lessonFacade.totalLessonCount()}}</p>
                </div>
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Active Lessons</p>
                  <p class="text-3xl font-bold text-purple-600">{{lessonFacade.getActiveLessonCount()}}</p>
                </div>
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Quick Actions</p>
                  <div class="mt-2">
                    <button
                      (click)="showCreateClassroom = true"
                      class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      <span>New Classroom</span>
                    </button>
                  </div>
                </div>
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Getting Started Guide for New Teachers -->
          @if (lessonFacade.totalLessonCount() === 0) {
            <div class="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-400 rounded-2xl p-6 shadow-lg">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-indigo-900 mb-2">Welcome to pen2class! 👋</h3>
                  <p class="text-indigo-800 mb-4">Get started with your first HTML coding classroom in just a few simple steps:</p>
                  <div class="space-y-3">
                    <div class="flex items-center space-x-3 text-indigo-700">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-indigo-800 font-bold text-sm" [class]="classroomFacade.classrooms().length > 0 ? 'bg-green-500 text-white' : 'bg-indigo-200'">
                        @if (classroomFacade.classrooms().length > 0) {
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                          </svg>
                        } @else {
                          <span>1</span>
                        }
                      </div>
                      <span class="font-medium">Create Classroom</span>
                      <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                    <div class="flex items-center space-x-3 text-indigo-700" title="To create a lesson, view the classroom card and press the 'Add Lesson' button">
                      <div class="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-800 font-bold text-sm">2</div>
                      <span class="font-medium">Add Lesson</span>
                      <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                    <div class="flex items-center space-x-3 text-indigo-700">
                      <div class="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-800 font-bold text-sm">3</div>
                      <span class="font-medium">View and track student code</span>
                    </div>
                  </div>
                  <div [hidden]="true" class="mt-4 pt-4 border-t border-indigo-200">
                    <button
                      (click)="showCreateClassroom = true"
                      class="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      <span>Create Your First Classroom Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Classrooms Section -->
          <div class="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden">
            <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-300/20">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <h2 class="text-xl font-bold text-white">My Classrooms</h2>
                  <span class="bg-white/20 text-white text-sm px-3 py-1 rounded-full font-medium">{{classroomFacade.classrooms().length}}</span>
                </div>
                <button
                  (click)="showCreateClassroom = true"
                  class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 border border-white/30">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span>Add Classroom</span>
                </button>
              </div>
            </div>

            <!-- Classroom List -->
            <div class="p-6">
              @if (classroomFacade.classrooms().length === 0) {
                <div class="text-center py-16">
                  <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-3">No Classrooms Yet</h3>
                  <p class="text-gray-600 mb-6 max-w-md mx-auto">Get started by creating your first classroom. You can add lessons, manage students, and track their progress.</p>
                  <button
                    (click)="showCreateClassroom = true"
                    class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                    Create Your First Classroom
                  </button>
                </div>
              } @else {
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  @for (classroom of classroomFacade.classrooms(); track classroom.id) {
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      <!-- Classroom Header -->
                      <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 relative">
                        <div class="absolute top-4 right-4">
                          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>

                        <div class="flex items-center space-x-4">
                          <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                          </div>
                          <div class="flex-1 min-w-0">
                            <h3 class="text-xl font-bold text-white truncate">{{classroom.name}}</h3>
                            @if (classroom.description) {
                              <p class="text-blue-100 text-sm mt-1 line-clamp-2">{{classroom.description}}</p>
                            }
                          </div>
                        </div>

                        <!-- Classroom Code -->
                        <div class="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                          <div class="flex items-center justify-between">
                            <span class="text-blue-100 text-sm font-medium">Access Code</span>
                            <div class="flex items-center space-x-2">
                              <code id="class-code" #code class="text-white font-mono text-lg font-bold tracking-widest">{{classroom.code}}</code>
                              <button (click)="copyToClipBoard(classroom.code)" class="text-blue-200 hover:text-white transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Classroom Stats -->
                      <div class="p-6">
                        <div class="grid grid-cols-3 gap-4 mb-6">
                          <div class="text-center">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                              </svg>
                            </div>
                            <p class="text-lg font-bold text-gray-900">{{$any(classroom).members?.length || 0}}</p>
                            <p class="text-xs text-gray-500">Members</p>
                          </div>
                          <div class="text-center">
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                              </svg>
                            </div>
                            <p class="text-lg font-bold text-gray-900">{{getLessonsForClassroom(classroom.id).length}}</p>
                            <p class="text-xs text-gray-500">Lessons</p>
                          </div>
                          <div class="text-center">
                            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            </div>
                            <p class="text-lg font-bold text-gray-900">{{classroom.createdAt | date:'MMM'}}</p>
                            <p class="text-xs text-gray-500">Created</p>
                          </div>
                        </div>

                    <!-- Lessons for this classroom -->
                    <div class="mt-4">
                      <div class="flex justify-between items-center mb-3">
                        <div class="flex items-center space-x-2">
                          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                          </svg>
                          <span class="text-sm font-semibold text-gray-700">Lessons ({{getLessonsForClassroom(classroom.id).length}})</span>
                        </div>
                        <button
                          (click)="showCreateLessonFor = showCreateLessonFor === classroom.id ? '' : classroom.id"
                          class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                          </svg>
                          <span>Add Lesson</span>
                        </button>
                      </div>

                      <!-- Create lesson form for this classroom -->
                      @if (showCreateLessonFor === classroom.id) {
                        <div class="mb-4 p-4 border border-green-200 rounded-xl bg-green-50/50">
                          <div class="flex items-center space-x-2 mb-3">
                            <div class="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                              </svg>
                            </div>
                            <h4 class="font-medium text-green-900">Add New Lesson</h4>
                          </div>
                          <div class="space-y-3">
                            <div>
                              <label class="block text-xs font-medium text-green-800 mb-1">Lesson Name</label>
                              <input
                                [(ngModel)]="createLessonForm.name"
                                placeholder="Enter lesson name"
                                class="w-full px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white">
                            </div>
                            <div>
                              <label class="block text-xs font-medium text-green-800 mb-1">Description (Optional)</label>
                              <textarea
                                [(ngModel)]="createLessonForm.description"
                                placeholder="Enter lesson description"
                                rows="2"
                                class="w-full px-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white resize-none">
                                    </textarea>
                            </div>
                            <div class="flex gap-2">
                              <button
                                (click)="createLesson(classroom.id)"
                                [disabled]="isCreatingLesson || !createLessonForm.name.trim()"
                                class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1">
                                @if (isCreatingLesson) {
                                  <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Creating...</span>
                                } @else {
                                  <span>Create Lesson</span>
                                }
                              </button>
                              <button
                                (click)="cancelCreateLesson()"
                                class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      }

                      <!-- Lessons list as individual cards -->
                      @if (getLessonsForClassroom(classroom.id).length === 0) {
                        <div class="text-center py-6 text-gray-500">
                          <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                          </svg>
                          <p class="text-sm">No lessons yet</p>
                          <p class="text-xs">Click "Add Lesson" to create your first lesson</p>
                        </div>
                      } @else {
                        <div class="grid grid-cols-1 gap-3">
                          @for (lesson of getLessonsForClassroom(classroom.id); track lesson.id) {
                            <div class="bg-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 relative">
                              <div class="flex items-start space-x-3">
                                <div class="w-8 h-8 rounded-lg flex items-center justify-center" [class]="lesson.enabled ? 'bg-green-100' : 'bg-gray-100'">
                                  <svg class="w-4 h-4" [class]="lesson.enabled ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                  </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                  <h5 class="font-semibold text-gray-900 truncate">{{lesson.name}}</h5>
                                  @if (lesson.description) {
                                    <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{lesson.description}}</p>
                                  }
                                </div>
                              </div>

                              <!-- Active/Inactive badge at top-right -->
                              <span class="absolute top-3 right-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" [class]="lesson.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                                <div class="w-1.5 h-1.5 rounded-full mr-1" [class]="lesson.enabled ? 'bg-green-400' : 'bg-gray-400'"></div>
                                {{lesson.enabled ? 'Active' : 'Inactive'}}
                              </span>

                              <!-- Action buttons stacked vertically under the title -->
                              <div class="mt-4 flex flex-row gap-2">
                                @if (lesson.enabled) {
                                  <button
                                    (click)="disableLesson(classroom.id, lesson.id)"
                                    class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>Disable</span>
                                  </button>
                                } @else {
                                  <button
                                    (click)="enableLesson(classroom.id, lesson.id)"
                                    class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Enable</span>
                                  </button>
                                }
                                <button
                                  (click)="viewLesson(classroom.id, lesson.id)"
                                  [disabled]="!lesson.enabled"
                                  class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1">
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  <span>View</span>
                                </button>
                                <button
                                  (click)="deleteLesson(classroom.id, lesson.id)"
                                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1">
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                  <!-- Classroom Actions -->
                  <div class="flex items-center justify-center mt-4 pt-4 border-t border-gray-100">
                    <button
                      (click)="deleteClassroom(classroom.id)"
                      class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 mb-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      <span>Delete Classroom</span>
                    </button>
                  </div>
                </div>
            }
          </div>
        }
      </div>

        </div>
      </div>

      <!-- Create Classroom Modal -->
      @if (showCreateClassroom) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="cancelCreateClassroom()">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 border-b border-blue-300/20">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-white">Create New Classroom</h3>
                </div>
                <button
                  (click)="cancelCreateClassroom()"
                  class="text-blue-200 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Classroom Name *</label>
                  <input
                    [(ngModel)]="createChannelForm.name"
                    placeholder="Enter classroom name"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    autofocus>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    [(ngModel)]="createChannelForm.description"
                    placeholder="Enter classroom description"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white resize-none">
                  </textarea>
                </div>
              </div>

              <!-- Modal Actions -->
              <div class="flex gap-3 mt-6">
                <button
                  (click)="cancelCreateClassroom()"
                  class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button
                  (click)="createClassroom()"
                  [disabled]="isCreatingClassroom || !createChannelForm.name.trim()"
                  class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg disabled:shadow-none">
                  @if (isCreatingClassroom) {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Create Classroom</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Create Lesson Modal -->
      @if (showCreateLessonFor) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="cancelCreateLesson()">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 border-b border-green-300/20">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-white">Add New Lesson</h3>
                </div>
                <button
                  (click)="cancelCreateLesson()"
                  class="text-green-200 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Lesson Name *</label>
                  <input
                    [(ngModel)]="createLessonForm.name"
                    placeholder="Enter lesson name"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    autofocus>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    [(ngModel)]="createLessonForm.description"
                    placeholder="Enter lesson description"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white resize-none">
                  </textarea>
                </div>
              </div>

              <!-- Modal Actions -->
              <div class="flex gap-3 mt-6">
                <button
                  (click)="cancelCreateLesson()"
                  class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button
                  (click)="createLesson(showCreateLessonFor)"
                  [disabled]="isCreatingLesson || !createLessonForm.name.trim()"
                  class="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg disabled:shadow-none">
                  @if (isCreatingLesson) {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Create Lesson</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Activity Log Modal -->
      @if (showActivityLog) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showActivityLog = false">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] border border-gray-100 overflow-hidden" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 border-b border-indigo-300/20">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-white">Activity Log</h3>
                  <span class="bg-white/20 text-white text-sm px-2 py-1 rounded-full font-medium">{{logEntries.length}}</span>
                </div>
                <button
                  (click)="showActivityLog = false"
                  class="text-indigo-200 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="flex flex-col h-96">
              <div class="flex-1 p-6 overflow-y-auto">
                @if (logEntries.length === 0) {
                  <div class="text-center py-16">
                    <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h4>
                    <p class="text-gray-600">Your admin actions will appear here</p>
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (entry of logEntries; track entry.timestamp) {
                      <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <p class="text-sm text-gray-900 font-medium">{{entry.message}}</p>
                            <p class="text-xs text-gray-500 mt-1">{{entry.timestamp}}</p>
                          </div>
                          <div class="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Modal Actions -->
              @if (logEntries.length > 0) {
                <div class="px-6 py-4 border-t border-gray-100">
                  <button
                    (click)="clearLog()"
                    class="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <span>Clear All Activity</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
    </div>`
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser = signal<UserDto | null>(null);

  createChannelForm: CreateChannelForm = { name: '', description: '' };
  createLessonForm: CreateLessonForm = { name: '', description: '', channelId: '' };

  showCreateClassroom = false;
  showCreateLessonFor = '';
  showActivityLog = false;
  isCreatingClassroom = false;
  isCreatingLesson = false;

  logEntries: { timestamp: string; message: string }[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private userStore: UserStoreService,
    public classroomFacade: ClassroomManagementFacade,
    public lessonFacade: LessonManagementFacade
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.initializeData();
    this.log('Admin dashboard initialized');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadCurrentUser() {
    // Get current user from UserService if available
    const currentUser = this.userStore.getCurrentUser();
    if (currentUser) {
      this.currentUser.set(<any>currentUser);
    }
  }

  private async initializeData() {
    try {
      // Load classrooms first
      const classrooms = await this.classroomFacade.loadClassrooms();

      // Then load lessons for all classrooms
      if (classrooms.length > 0) {
        const classroomIds = classrooms.map(c => c.id);
        await this.lessonFacade.loadLessonsForClassrooms(classroomIds);
      }
    } catch (error: any) {
      this.log(`Failed to initialize data: ${error.error?.message || error.message}`);
    }
  }

  async createClassroom() {
    if (!this.createChannelForm.name.trim()) {
      this.log('Classroom name is required');
      return;
    }

    this.isCreatingClassroom = true;

    try {
      const classroom = await this.classroomFacade.createClassroom({
        name: this.createChannelForm.name.trim(),
        description: this.createChannelForm.description.trim() || undefined
      });

      this.log(`Created classroom: ${classroom.name}`);
      this.createChannelForm = { name: '', description: '' };
      this.showCreateClassroom = false;

      // Reload lessons for the new classroom
      await this.lessonFacade.loadLessonsForClassroom(classroom.id);
    } catch (error: any) {
      this.log(`Failed to create classroom: ${error.error?.message || error.message}`);
    } finally {
      this.isCreatingClassroom = false;
    }
  }

  cancelCreateClassroom() {
    this.createChannelForm = { name: '', description: '' };
    this.showCreateClassroom = false;
  }

  async createLesson(channelId: string) {
    if (!this.createLessonForm.name.trim()) {
      this.log('Lesson name is required');
      return;
    }

    this.isCreatingLesson = true;

    try {
      const lesson = await this.lessonFacade.createLesson(channelId, {
        createdBy:this.userStore.getCurrentUser()?.id as string,
        name: this.createLessonForm.name.trim(),
        description: this.createLessonForm.description.trim() || undefined,
        enabled: true
      });

      this.log(`Created lesson: ${lesson.name}`);
      this.createLessonForm = { name: '', description: '', channelId: '' };
      this.showCreateLessonFor = '';
    } catch (error: any) {
      this.log(`Failed to create lesson: ${error.error?.message || error.message}`);
    } finally {
      this.isCreatingLesson = false;
    }
  }

  cancelCreateLesson() {
    this.createLessonForm = { name: '', description: '', channelId: '' };
    this.showCreateLessonFor = '';
  }

  async enableLesson(channelId: string, lessonId: string) {
    const success = await this.lessonFacade.enableLesson(channelId, lessonId);
    if (success) {
      this.log(`Enabled lesson`);
    } else {
      this.log(`Failed to enable lesson`);
    }
  }

  async disableLesson(channelId: string, lessonId: string) {
    const success = await this.lessonFacade.disableLesson(channelId, lessonId);
    if (success) {
      this.log(`Disabled lesson`);
    } else {
      this.log(`Failed to disable lesson`);
    }
  }

  async startLesson(channelId: string, lessonId: string) {
    const success = await this.lessonFacade.startLesson(channelId, lessonId);
    if (success) {
      this.log(`Started lesson`);
    } else {
      this.log(`Failed to start lesson`);
    }
  }

  getLessonsForClassroom(classroomId: string): LessonSummary[] {
    return this.lessonFacade.getLessonsForClassroom(classroomId);
  }

  async deleteClassroom(classroomId: string) {
    if (!confirm('Are you sure you want to delete this classroom? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await this.classroomFacade.deleteClassroom(classroomId);
      if (success) {
        this.log(`Deleted classroom successfully`);
        // Refresh data after deletion
        await this.initializeData();
      } else {
        this.log(`Failed to delete classroom`);
      }
    } catch (error: any) {
      this.log(`Failed to delete classroom: ${error.error?.message || error.message}`);
    }
  }

  async deleteLesson(channelId: string, lessonId: string) {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await this.lessonFacade.deleteLesson(channelId, lessonId,
        this.userStore.getCurrentUser()?.id as string);
      if (success) {
        this.log(`Deleted lesson successfully`);
      } else {
        this.log(`Failed to delete lesson`);
      }
    } catch (error: any) {
      this.log(`Failed to delete lesson: ${error.error?.message || error.message}`);
    }
  }

  copyToClipBoard(code: string) {
    if (!code) {
      this.log('No access code to copy');
      return;
    }
    // Prefer modern clipboard API when available
    const nav: any = navigator as any;
    if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
      nav.clipboard.writeText(code)
        .then(() => this.log('Access code copied to clipboard'))
        .catch(() => this.fallbackCopy(code));
      return;
    }
    this.fallbackCopy(code);
  }

  private fallbackCopy(text: string) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.log('Access code copied to clipboard');
    } catch (e) {
      this.log('Failed to copy access code');
    }
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logEntries.unshift({ timestamp, message });

    if (this.logEntries.length > 100) {
      this.logEntries = this.logEntries.slice(0, 100);
    }
  }

  viewLesson(channelId: string, lessonId: string) {
    this.router.navigate([
      RouteConstants.Paths.admin,
      RouteConstants.Paths.classroom,
      channelId,
      RouteConstants.Paths.lesson,
      lessonId,
    ]);
  }

  clearLog() {
    this.logEntries = [];
  }
}
