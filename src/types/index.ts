export interface Course {
  id: string;
  name: string;
  title?: string;
  group?: string;
  enrollments?: number;
  total_folders?: number;
  total_videos?: number;
  total_pdfs?: number;
  total_tests?: number;
  total_content?: number;
  api_url?: string;
  thumbnail?: string;
}

export interface LectureVideo {
  title: string;
  asset: string;
}

export interface ActiveVideoState {
  assetId: string;
  title: string;
  courseTitle?: string;
  index?: number;
  embedUrl?: string;
  videoUrl?: string;
  loading?: boolean;
}

export interface LecturePdf {
  title: string;
  link?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  videos?: LectureVideo[];
  pdfs?: LecturePdf[];
  tests?: any[];
  total_items?: number;
}

export interface CourseDetailResponse {
  status: string;
  code: number;
  action: string;
  course_id: string;
  course: Course;
  tree: TreeNode[];
  raw_tree?: any;
  catalog?: Record<string, any>;
  folder_content?: any;
}

export interface SearchIndexItem {
  id: string;
  name: string;
  title?: string;
  group?: string;
  enrollments?: number;
  total_videos?: number;
  total_pdfs?: number;
  thumbnail: string;
  lecturesCount: number;
  sampleLectures?: Array<{
    title: string;
    asset?: string;
    path: string;
    type: 'video' | 'pdf';
  }>;
}
