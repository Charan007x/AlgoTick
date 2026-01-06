// Real LeetCode problems organized by topic
// These are verified to exist on leetcode.com

const LEETCODE_PROBLEMS_BY_TOPIC = {
  "Array": [
    { title: "Two Sum", slug: "two-sum", difficulty: "Easy", topics: ["Array", "Hash Table"], time: "15 mins" },
    { title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", topics: ["Array", "Dynamic Programming"], time: "20 mins" },
    { title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "Easy", topics: ["Array", "Hash Table"], time: "15 mins" },
    { title: "Product of Array Except Self", slug: "product-of-array-except-self", difficulty: "Medium", topics: ["Array", "Prefix Sum"], time: "30 mins" },
    { title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", topics: ["Array", "Dynamic Programming"], time: "25 mins" },
    { title: "3Sum", slug: "3sum", difficulty: "Medium", topics: ["Array", "Two Pointers"], time: "35 mins" },
    { title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", topics: ["Array", "Two Pointers"], time: "25 mins" },
    { title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "Medium", topics: ["Array", "Binary Search"], time: "30 mins" }
  ],
  "String": [
    { title: "Valid Anagram", slug: "valid-anagram", difficulty: "Easy", topics: ["String", "Hash Table"], time: "15 mins" },
    { title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "Easy", topics: ["String", "Two Pointers"], time: "15 mins" },
    { title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium", topics: ["String", "Sliding Window"], time: "30 mins" },
    { title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", difficulty: "Medium", topics: ["String", "Dynamic Programming"], time: "35 mins" },
    { title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium", topics: ["String", "Hash Table"], time: "25 mins" },
    { title: "Palindromic Substrings", slug: "palindromic-substrings", difficulty: "Medium", topics: ["String", "Dynamic Programming"], time: "30 mins" }
  ],
  "Hash Table": [
    { title: "Two Sum", slug: "two-sum", difficulty: "Easy", topics: ["Array", "Hash Table"], time: "15 mins" },
    { title: "Valid Anagram", slug: "valid-anagram", difficulty: "Easy", topics: ["String", "Hash Table"], time: "15 mins" },
    { title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium", topics: ["String", "Hash Table"], time: "25 mins" },
    { title: "Top K Frequent Elements", slug: "top-k-frequent-elements", difficulty: "Medium", topics: ["Array", "Hash Table"], time: "25 mins" },
    { title: "Subarray Sum Equals K", slug: "subarray-sum-equals-k", difficulty: "Medium", topics: ["Array", "Hash Table"], time: "30 mins" }
  ],
  "Dynamic Programming": [
    { title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy", topics: ["Dynamic Programming"], time: "15 mins" },
    { title: "House Robber", slug: "house-robber", difficulty: "Medium", topics: ["Array", "Dynamic Programming"], time: "25 mins" },
    { title: "Coin Change", slug: "coin-change", difficulty: "Medium", topics: ["Dynamic Programming"], time: "30 mins" },
    { title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", difficulty: "Medium", topics: ["Dynamic Programming"], time: "35 mins" },
    { title: "Unique Paths", slug: "unique-paths", difficulty: "Medium", topics: ["Dynamic Programming"], time: "25 mins" },
    { title: "Word Break", slug: "word-break", difficulty: "Medium", topics: ["String", "Dynamic Programming"], time: "30 mins" },
    { title: "Edit Distance", slug: "edit-distance", difficulty: "Medium", topics: ["String", "Dynamic Programming"], time: "40 mins" }
  ],
  "Linked List": [
    { title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", topics: ["Linked List"], time: "15 mins" },
    { title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy", topics: ["Linked List"], time: "20 mins" },
    { title: "Linked List Cycle", slug: "linked-list-cycle", difficulty: "Easy", topics: ["Linked List", "Two Pointers"], time: "20 mins" },
    { title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", difficulty: "Medium", topics: ["Linked List", "Two Pointers"], time: "25 mins" },
    { title: "Reorder List", slug: "reorder-list", difficulty: "Medium", topics: ["Linked List"], time: "30 mins" },
    { title: "Add Two Numbers", slug: "add-two-numbers", difficulty: "Medium", topics: ["Linked List"], time: "25 mins" }
  ],
  "Tree": [
    { title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", topics: ["Tree", "Depth-First Search"], time: "15 mins" },
    { title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "Easy", topics: ["Tree"], time: "15 mins" },
    { title: "Same Tree", slug: "same-tree", difficulty: "Easy", topics: ["Tree"], time: "15 mins" },
    { title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "Medium", topics: ["Tree", "Breadth-First Search"], time: "25 mins" },
    { title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", difficulty: "Medium", topics: ["Tree", "Depth-First Search"], time: "30 mins" },
    { title: "Lowest Common Ancestor of a Binary Search Tree", slug: "lowest-common-ancestor-of-a-binary-search-tree", difficulty: "Medium", topics: ["Tree"], time: "25 mins" }
  ],
  "Binary Tree": [
    { title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", topics: ["Tree", "Depth-First Search"], time: "15 mins" },
    { title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "Easy", topics: ["Tree"], time: "15 mins" },
    { title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "Medium", topics: ["Tree", "Breadth-First Search"], time: "25 mins" },
    { title: "Subtree of Another Tree", slug: "subtree-of-another-tree", difficulty: "Easy", topics: ["Tree"], time: "20 mins" }
  ],
  "Graph": [
    { title: "Number of Islands", slug: "number-of-islands", difficulty: "Medium", topics: ["Graph", "Depth-First Search"], time: "30 mins" },
    { title: "Clone Graph", slug: "clone-graph", difficulty: "Medium", topics: ["Graph", "Depth-First Search"], time: "30 mins" },
    { title: "Course Schedule", slug: "course-schedule", difficulty: "Medium", topics: ["Graph", "Topological Sort"], time: "35 mins" },
    { title: "Pacific Atlantic Water Flow", slug: "pacific-atlantic-water-flow", difficulty: "Medium", topics: ["Graph", "Depth-First Search"], time: "35 mins" },
    { title: "Graph Valid Tree", slug: "graph-valid-tree", difficulty: "Medium", topics: ["Graph"], time: "30 mins" }
  ],
  "Depth-First Search": [
    { title: "Number of Islands", slug: "number-of-islands", difficulty: "Medium", topics: ["Graph", "Depth-First Search"], time: "30 mins" },
    { title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", topics: ["Tree", "Depth-First Search"], time: "15 mins" },
    { title: "Path Sum", slug: "path-sum", difficulty: "Easy", topics: ["Tree", "Depth-First Search"], time: "20 mins" },
    { title: "Binary Tree Paths", slug: "binary-tree-paths", difficulty: "Easy", topics: ["Tree", "Depth-First Search"], time: "20 mins" }
  ],
  "Breadth-First Search": [
    { title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "Medium", topics: ["Tree", "Breadth-First Search"], time: "25 mins" },
    { title: "Rotting Oranges", slug: "rotting-oranges", difficulty: "Medium", topics: ["Array", "Breadth-First Search"], time: "30 mins" },
    { title: "Word Ladder", slug: "word-ladder", difficulty: "Hard", topics: ["String", "Breadth-First Search"], time: "40 mins" }
  ],
  "Binary Search": [
    { title: "Binary Search", slug: "binary-search", difficulty: "Easy", topics: ["Binary Search"], time: "15 mins" },
    { title: "Search Insert Position", slug: "search-insert-position", difficulty: "Easy", topics: ["Array", "Binary Search"], time: "15 mins" },
    { title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", difficulty: "Medium", topics: ["Array", "Binary Search"], time: "25 mins" },
    { title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "Medium", topics: ["Array", "Binary Search"], time: "30 mins" },
    { title: "Find Peak Element", slug: "find-peak-element", difficulty: "Medium", topics: ["Array", "Binary Search"], time: "25 mins" }
  ],
  "Two Pointers": [
    { title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "Easy", topics: ["String", "Two Pointers"], time: "15 mins" },
    { title: "Two Sum II", slug: "two-sum-ii-input-array-is-sorted", difficulty: "Medium", topics: ["Array", "Two Pointers"], time: "20 mins" },
    { title: "3Sum", slug: "3sum", difficulty: "Medium", topics: ["Array", "Two Pointers"], time: "35 mins" },
    { title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", topics: ["Array", "Two Pointers"], time: "25 mins" },
    { title: "Remove Duplicates from Sorted Array", slug: "remove-duplicates-from-sorted-array", difficulty: "Easy", topics: ["Array", "Two Pointers"], time: "15 mins" }
  ],
  "Sliding Window": [
    { title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium", topics: ["String", "Sliding Window"], time: "30 mins" },
    { title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: "Hard", topics: ["String", "Sliding Window"], time: "45 mins" },
    { title: "Permutation in String", slug: "permutation-in-string", difficulty: "Medium", topics: ["String", "Sliding Window"], time: "30 mins" },
    { title: "Find All Anagrams in a String", slug: "find-all-anagrams-in-a-string", difficulty: "Medium", topics: ["String", "Sliding Window"], time: "30 mins" },
    { title: "Max Consecutive Ones III", slug: "max-consecutive-ones-iii", difficulty: "Medium", topics: ["Array", "Sliding Window"], time: "25 mins" }
  ],
  "Greedy": [
    { title: "Jump Game", slug: "jump-game", difficulty: "Medium", topics: ["Array", "Greedy"], time: "25 mins" },
    { title: "Jump Game II", slug: "jump-game-ii", difficulty: "Medium", topics: ["Array", "Greedy"], time: "30 mins" },
    { title: "Gas Station", slug: "gas-station", difficulty: "Medium", topics: ["Array", "Greedy"], time: "30 mins" },
    { title: "Hand of Straights", slug: "hand-of-straights", difficulty: "Medium", topics: ["Array", "Greedy"], time: "30 mins" }
  ],
  "Backtracking": [
    { title: "Subsets", slug: "subsets", difficulty: "Medium", topics: ["Array", "Backtracking"], time: "25 mins" },
    { title: "Permutations", slug: "permutations", difficulty: "Medium", topics: ["Array", "Backtracking"], time: "30 mins" },
    { title: "Combination Sum", slug: "combination-sum", difficulty: "Medium", topics: ["Array", "Backtracking"], time: "30 mins" },
    { title: "Word Search", slug: "word-search", difficulty: "Medium", topics: ["Array", "Backtracking"], time: "35 mins" },
    { title: "Palindrome Partitioning", slug: "palindrome-partitioning", difficulty: "Medium", topics: ["String", "Backtracking"], time: "35 mins" }
  ],
  "Stack": [
    { title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", topics: ["String", "Stack"], time: "15 mins" },
    { title: "Min Stack", slug: "min-stack", difficulty: "Medium", topics: ["Stack", "Design"], time: "25 mins" },
    { title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", difficulty: "Medium", topics: ["Array", "Stack"], time: "25 mins" },
    { title: "Daily Temperatures", slug: "daily-temperatures", difficulty: "Medium", topics: ["Array", "Stack"], time: "30 mins" }
  ],
  "Heap": [
    { title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", difficulty: "Medium", topics: ["Array", "Heap"], time: "25 mins" },
    { title: "Top K Frequent Elements", slug: "top-k-frequent-elements", difficulty: "Medium", topics: ["Array", "Heap"], time: "25 mins" },
    { title: "Find Median from Data Stream", slug: "find-median-from-data-stream", difficulty: "Hard", topics: ["Heap", "Design"], time: "40 mins" }
  ],
  "Trie": [
    { title: "Implement Trie (Prefix Tree)", slug: "implement-trie-prefix-tree", difficulty: "Medium", topics: ["Trie", "Design"], time: "30 mins" },
    { title: "Design Add and Search Words Data Structure", slug: "design-add-and-search-words-data-structure", difficulty: "Medium", topics: ["Trie", "Design"], time: "35 mins" },
    { title: "Word Search II", slug: "word-search-ii", difficulty: "Hard", topics: ["Array", "Trie"], time: "45 mins" }
  ],
  "Math": [
    { title: "Palindrome Number", slug: "palindrome-number", difficulty: "Easy", topics: ["Math"], time: "15 mins" },
    { title: "Reverse Integer", slug: "reverse-integer", difficulty: "Medium", topics: ["Math"], time: "20 mins" },
    { title: "Pow(x, n)", slug: "powx-n", difficulty: "Medium", topics: ["Math"], time: "25 mins" },
    { title: "Count Primes", slug: "count-primes", difficulty: "Medium", topics: ["Math"], time: "30 mins" }
  ],
  "Bit Manipulation": [
    { title: "Single Number", slug: "single-number", difficulty: "Easy", topics: ["Array", "Bit Manipulation"], time: "15 mins" },
    { title: "Number of 1 Bits", slug: "number-of-1-bits", difficulty: "Easy", topics: ["Bit Manipulation"], time: "15 mins" },
    { title: "Counting Bits", slug: "counting-bits", difficulty: "Easy", topics: ["Dynamic Programming", "Bit Manipulation"], time: "20 mins" },
    { title: "Reverse Bits", slug: "reverse-bits", difficulty: "Easy", topics: ["Bit Manipulation"], time: "20 mins" }
  ],
  "Sorting": [
    { title: "Sort Colors", slug: "sort-colors", difficulty: "Medium", topics: ["Array", "Sorting"], time: "25 mins" },
    { title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium", topics: ["Array", "Sorting"], time: "30 mins" },
    { title: "Insert Interval", slug: "insert-interval", difficulty: "Medium", topics: ["Array", "Sorting"], time: "30 mins" }
  ],
  "Simulation": [
    { title: "Spiral Matrix", slug: "spiral-matrix", difficulty: "Medium", topics: ["Array", "Simulation"], time: "30 mins" },
    { title: "Rotate Image", slug: "rotate-image", difficulty: "Medium", topics: ["Array", "Simulation"], time: "25 mins" }
  ],
  "Enumeration": [
    { title: "Fizz Buzz", slug: "fizz-buzz", difficulty: "Easy", topics: ["Math", "Enumeration"], time: "10 mins" },
    { title: "Happy Number", slug: "happy-number", difficulty: "Easy", topics: ["Math", "Enumeration"], time: "15 mins" }
  ],
  "Design": [
    { title: "LRU Cache", slug: "lru-cache", difficulty: "Medium", topics: ["Design", "Hash Table"], time: "35 mins" },
    { title: "Min Stack", slug: "min-stack", difficulty: "Medium", topics: ["Stack", "Design"], time: "25 mins" },
    { title: "Implement Trie (Prefix Tree)", slug: "implement-trie-prefix-tree", difficulty: "Medium", topics: ["Trie", "Design"], time: "30 mins" }
  ]
};

module.exports = { LEETCODE_PROBLEMS_BY_TOPIC };
