// Common event enums and OpenAPI schemas for join/leave-like emits

export enum JoinEvent {
  MEMBER_JOINED = 'member_joined',
  MEMBER_DASH_JOINED = 'member-joined',
  USER_JOINED = 'user_joined',
  JOINED = 'joined',
}

export enum LeaveEvent {
  MEMBER_LEFT = 'member_left',
  MEMBER_DASH_LEFT = 'member-left',
  USER_LEFT = 'user_left',
  LEFT = 'left',
}

export enum ObjectEvent {
  OBJECT_CREATED = 'object_created',
}

export const ObjectEventSchema = {
  title: 'ObjectEvent',
  type: 'string',
  enum: [
    ObjectEvent.OBJECT_CREATED,
  ]
};

export const JoinEventSchema = {
  title: 'JoinEvent',
  type: 'string',
  enum: [
    JoinEvent.MEMBER_JOINED,
    JoinEvent.MEMBER_DASH_JOINED,
    JoinEvent.USER_JOINED,
    JoinEvent.JOINED,
  ],
};

export const LeaveEventSchema = {
  title: 'LeaveEvent',
  type: 'string',
  enum: [
    LeaveEvent.MEMBER_LEFT,
    LeaveEvent.MEMBER_DASH_LEFT,
    LeaveEvent.USER_LEFT,
    LeaveEvent.LEFT,
  ],
};
