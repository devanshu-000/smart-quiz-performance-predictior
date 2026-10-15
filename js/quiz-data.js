// --- QUIZ DATABASE WITH DIFFICULTY LEVELS & ENHANCED QUESTIONS ---
const quizDatabase = [
    {
        id: 'js-low',
        title: 'Basic Arithmetic & Variables',
        subject: 'Programming Fundamentals',
        difficulty: 'Low',
        description: 'Very simple questions covering operators (+, -, *, /) and basic variable assignments.',
        questions: [
            {
                q: 'What is the result of `5 + 3` in JavaScript?',
                options: ['53', '8', 'Error', '5+3'],
                answer: 1
            },
            {
                q: 'Which symbol is used for assignment in programming variables?',
                options: ['==', '=', '===', '->'],
                answer: 1
            },
            {
                q: 'What is the result of `10 - 4`?',
                options: ['6', '14', '40', '4'],
                answer: 0
            },
            {
                q: 'Which operator is used to multiply numbers in programming?',
                options: ['x', '*', '#', '%'],
                answer: 1
            }
        ]
    },
    {
        id: 'js-mid',
        title: 'Intermediate JavaScript & Arrays',
        subject: 'Programming',
        difficulty: 'Mid',
        description: 'Test your understanding of array methods, conditionals, and functions.',
        questions: [
            {
                q: 'What is the output of `typeof null` in JavaScript?',
                options: ['null', 'undefined', 'object', 'number'],
                answer: 2
            },
            {
                q: 'Which method converts a JSON string into a JavaScript object?',
                options: ['JSON.parse()', 'JSON.stringify()', 'JSON.toObject()', 'parse.JSON()'],
                answer: 0
            },
            {
                q: 'Which array method creates a new array with all elements that pass a test?',
                options: ['map()', 'filter()', 'reduce()', 'forEach()'],
                answer: 1
            },
            {
                q: 'How do you check the length of an array named `arr`?',
                options: ['arr.size()', 'arr.length', 'arr.count()', 'len(arr)'],
                answer: 1
            }
        ]
    },
    {
        id: 'ds-high',
        title: 'Advanced Data Structures & Sorting',
        subject: 'Computer Science',
        difficulty: 'High',
        description: 'Challenging questions on trees, graph traversal, and sorting efficiency.',
        questions: [
            {
                q: 'What is the worst-case time complexity of standard QuickSort?',
                options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'],
                answer: 2
            },
            {
                q: 'What is the time complexity of searching an element in a balanced Binary Search Tree?',
                options: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'],
                answer: 2
            },
            {
                q: 'Which graph traversal algorithm uses a Queue data structure?',
                options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra Algorithm', 'Bellman-Ford'],
                answer: 1
            }
        ]
    },
    {
        id: 'algo-extream',
        title: 'Extreme Algorithms & Complexity',
        subject: 'Computer Science',
        difficulty: 'Extream',
        description: 'Expert-level algorithmic theory, NP-completeness, and advanced graph theory.',
        questions: [
            {
                q: 'Which of the following problems is known to be NP-Complete?',
                options: ['Shortest Path Problem', 'Travelling Salesperson Problem (Decision version)', 'Matrix Multiplication', 'Binary Search'],
                answer: 1
            },
            {
                q: 'In amortized analysis of data structures, what does the potential method measure?',
                options: ['Maximum memory allocated', 'Stored potential energy or credit to pay for future expensive operations', 'Worst-case CPU cycles', 'Garbage collection threshold'],
                answer: 1
            },
            {
                q: 'What is the time complexity of the Ford-Fulkerson method for max flow using Edmonds-Karp algorithm?',
                options: ['O(V^2 * E)', 'O(E * V)', 'O(E^2 * V)', 'O(V log V)'],
                answer: 0
            }
        ]
    }
];
