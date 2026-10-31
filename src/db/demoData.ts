import type { CourseRecord, DocumentChunk } from './schema';

export const DEMO_COURSE_RECORD: CourseRecord = {
  id: 'course-cos2614-demo',
  code: 'COS2614',
  title: 'Programming: Data Structures & Algorithms',
  sourceType: 'Tutorial Letter (TL101)',
  academicPeriod: 'Semester 1',
  academicYear: '2025',
  department: 'School of Computing',
  nqfLevel: 'Level 6',
  credits: '12 Credits',
  classification: {
    category: 'Tutorial Letter (TL101)',
    confidence: 98,
    detectedKeywords: ['tutorial letter', 'tl101', 'unisa', 'data structures', 'assessment plan'],
    isUserConfirmed: true
  },
  contacts: [
    {
      name: 'Prof. M. R. Mamba',
      role: 'Primary Lecturer',
      email: 'mambamr@unisa.ac.za',
      phone: '+27 12 429 6000',
      officeOrChannel: 'GJ Gerwel Building, Room 4-32'
    },
    {
      name: 'COS2614 Department Mailbox',
      role: 'Module Mailbox',
      email: 'COS2614@unisa.ac.za',
      officeOrChannel: 'myUnisa Discussion Forum'
    }
  ],
  resources: [
    {
      id: 'res-demo-1',
      title: 'Data Structures and Algorithm Analysis in C++',
      authors: 'Mark Allen Weiss',
      identifier: 'ISBN: 9780132847377',
      type: 'Prescribed Book',
      isMandatory: true,
      notes: '4th Edition, Pearson Education'
    },
    {
      id: 'res-demo-2',
      title: 'C++ GUI Programming with Qt 4',
      authors: 'Jasmin Blanchette & Mark Summerfield',
      identifier: 'ISBN: 9780132354165',
      type: 'E-Reserve',
      isMandatory: false,
      notes: 'Prentice Hall Open Educational Access'
    }
  ],
  milestones: [
    {
      id: 'm-cos2614-1',
      parentCourseId: 'course-cos2614-demo',
      title: 'Assignment 01 (MCQ Formative Assessment)',
      type: 'MCQ Online Quiz',
      dueDate: '2025-03-25',
      weightOrScore: '20%',
      isCompulsory: true,
      status: 'Completed',
      notes: 'Covers Units 1 to 3: Arrays, Linked Lists, and Templates'
    },
    {
      id: 'm-cos2614-2',
      parentCourseId: 'course-cos2614-demo',
      title: 'Assignment 02 (Written Programming Project)',
      type: 'Written Project',
      dueDate: '2025-04-30',
      weightOrScore: '30%',
      isCompulsory: true,
      status: 'In Progress',
      notes: 'C++ Object-Oriented Application using Qt Framework & Binary Trees'
    },
    {
      id: 'm-cos2614-3',
      parentCourseId: 'course-cos2614-demo',
      title: 'Final Examination (Invigilated Proctoring App)',
      type: 'Summative Examination',
      dueDate: '2025-06-12',
      weightOrScore: '50%',
      isCompulsory: true,
      status: 'Pending',
      notes: 'Invigilator App upload required within 30 minutes of completion'
    }
  ],
  curriculum: [
    {
      unitIndex: 1,
      title: 'C++ Object-Oriented Principles & Template Classes',
      topics: ['Class Hierarchies', 'Polymorphism', 'Template Functions', 'Memory Allocation'],
      alignedReadings: ['Chapter 1: C++ Primitive Types & Pointers'],
      weekSpan: 'Week 1-2'
    },
    {
      unitIndex: 2,
      title: 'Linear Data Structures: Linked Lists, Stacks & Queues',
      topics: ['Singly Linked Lists', 'Doubly Linked Lists', 'LIFO Stacks', 'FIFO Queues'],
      alignedReadings: ['Chapter 3: Lists, Stacks and Queues'],
      weekSpan: 'Week 3-4'
    },
    {
      unitIndex: 3,
      title: 'Trees & Search Algorithms: Binary Search Trees & AVL Trees',
      topics: ['Tree Traversals (Inorder/Preorder/Postorder)', 'BST Insertion & Deletion', 'AVL Tree Rotations'],
      alignedReadings: ['Chapter 4: Trees and Balanced Search Structures'],
      weekSpan: 'Week 5-7'
    },
    {
      unitIndex: 4,
      title: 'Sorting Algorithms & Hash Tables',
      topics: ['Quicksort & Mergesort', 'Hash Functions', 'Collision Resolution (Chaining vs Open Addressing)'],
      alignedReadings: ['Chapter 5 & 7: Hashing & Sorting'],
      weekSpan: 'Week 8-10'
    },
    {
      unitIndex: 5,
      title: 'Exam Revision & Scope Preparation',
      topics: ['Previous Exam Papers', 'Mock Coding Questions', 'Invigilator App Procedures'],
      alignedReadings: ['Past Examination Scope Guide'],
      weekSpan: 'Week 11 up to exams'
    }
  ],
  chunksCount: 4,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

export const DEMO_CHUNKS: DocumentChunk[] = [
  {
    id: 'chunk-cos2614-demo-1',
    courseId: 'course-cos2614-demo',
    sectionKey: 'overview',
    heading: 'MODULE OVERVIEW & LEARNING OUTCOMES',
    text: 'COS2614 introduces advanced Object-Oriented Programming (OOP) in C++ together with linear and non-linear data structures including Singly/Doubly Linked Lists, Stacks, Queues, Binary Search Trees (BST), AVL Trees, Hash Tables, and Sorting algorithms (Quicksort, Mergesort). Students learn memory management with pointers, dynamic allocation, and GUI application development using the Qt framework.',
    startPage: 1,
    endPage: 2,
    chunkIndex: 1,
    createdAt: Date.now()
  },
  {
    id: 'chunk-cos2614-demo-2',
    courseId: 'course-cos2614-demo',
    sectionKey: 'assessments',
    heading: 'ASSESSMENT PLAN & WEIGHTING MATRIX',
    text: 'The assessment strategy for COS2614 comprises two formative assignments and one final summative examination. Assignment 01 is an MCQ quiz (20% of year mark). Assignment 02 is a written C++ programming project (30% of year mark). The final examination counts 50% towards the module final mark. Both assignments are compulsory for admission to the examination.',
    startPage: 4,
    endPage: 5,
    chunkIndex: 2,
    createdAt: Date.now()
  },
  {
    id: 'chunk-cos2614-demo-3',
    courseId: 'course-cos2614-demo',
    sectionKey: 'resources',
    heading: 'PRESCRIBED BOOKS & ISBN REFERENCE',
    text: 'The prescribed textbook for COS2614 is "Data Structures and Algorithm Analysis in C++" (4th Edition) by Mark Allen Weiss, published by Pearson (ISBN: 9780132847377). Recommended supplementary material includes "C++ GUI Programming with Qt 4" by Jasmin Blanchette and Mark Summerfield (ISBN: 9780132354165).',
    startPage: 3,
    endPage: 3,
    chunkIndex: 3,
    createdAt: Date.now()
  },
  {
    id: 'chunk-cos2614-demo-4',
    courseId: 'course-cos2614-demo',
    sectionKey: 'invigilation',
    heading: 'INVIGILATION & PROCTORING SYSTEM REQUIREMENTS',
    text: 'The final examination for COS2614 is invigilated using the official Unisa Invigilator Mobile Application. Students must ensure their mobile smartphones are fully charged, possess working camera access, and have internet connectivity to scan the QR code at the start of the examination and upload script photos within 30 minutes of paper completion.',
    startPage: 6,
    endPage: 7,
    chunkIndex: 4,
    createdAt: Date.now()
  }
];
