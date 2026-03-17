import api from './api';

export interface MeetingParticipant {
  id: string;
  user: { id: string; name: string; avatar?: string };
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  joinedAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  organizer: { id: string; name: string; avatar?: string };
  participants: MeetingParticipant[];
  _count?: {
    participants: number;
  };
}

export const fetchMeetings = async (): Promise<{ upcoming: Meeting[]; past: Meeting[] }> => {
  const response = await api.get('/meetings');
  return response.data.data as { upcoming: Meeting[]; past: Meeting[] };
};

export const createMeeting = async (payload: {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  participantIds?: string[];
}) => {
  const response = await api.post('/meetings', payload);
  return response.data.data as Meeting;
};

export const getMeetingDetails = async (id: string) => {
  const response = await api.get(`/meetings/${id}`);
  return response.data.data as Meeting;
};

export const updateMeeting = async (id: string, changes: Partial<Omit<Meeting, 'id'>> & { status?: string }) => {
  const response = await api.put(`/meetings/${id}`, changes);
  return response.data.data as Meeting;
};

export const deleteMeeting = async (id: string) => {
  const response = await api.delete(`/meetings/${id}`);
  return response.data;
};
