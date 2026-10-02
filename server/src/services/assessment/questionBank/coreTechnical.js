/**
 * SkillProof Assessment Question Bank - Core Technical Skills
 * 
 * Skills:
 * 1. Linux
 * 2. Computer Networks
 * 3. Operating Systems
 * 4. Data Structures
 * 5. Algorithms
 * 6. OOP
 * 7. System Design
 * 8. Cybersecurity
 * 
 * Strictly 5 questions per skill, progressive difficulty (Easy -> Easy/Med -> Med -> Med/Hard -> Hard).
 */

export const CORE_TECHNICAL_QUESTIONS = {
  // ==========================================
  // 1. Linux
  // ==========================================
  'Linux': [
    {
      id: 'linux_q1',
      skill: 'Linux',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write the Linux command to find all files ending in ".log" modified within the last 7 days under "/var/log" using the "find" command.',
      starterCode: 'find /var/log ',
      expectedAnswer: 'find /var/log -name "*.log" -mtime -7',
      points: 20,
      validationCriteria: {
        requiredElements: ['find /var/log', '-name "*.log"', '-mtime']
      },
      explanation: 'find /var/log -name "*.log" -mtime -7 locates files modified within 7 days.'
    },
    {
      id: 'linux_q2',
      skill: 'Linux',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Explain Linux file permissions: write the chmod command to set permissions on "deploy.sh" so that the Owner has read, write, and execute (rwx), Group has read and execute (r-x), and Others have no permissions (---).',
      starterCode: '# Set permissions in octal notation:\nchmod ',
      expectedAnswer: 'chmod 750 deploy.sh',
      points: 20,
      validationCriteria: {
        requiredElements: ['chmod 750', 'deploy.sh']
      },
      explanation: '7 = rwx (4+2+1), 5 = r-x (4+1), 0 = ---, yielding octal mode 750.'
    },
    {
      id: 'linux_q3',
      skill: 'Linux',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a pipeline of Linux commands using grep, sort, uniq, and awk to parse an access log "access.log" and output the top 5 most frequent client IP addresses.',
      starterCode: '# Pipeline to find top 5 IPs in access.log:\n',
      expectedAnswer: 'awk \'{print $1}\' access.log | sort | uniq -c | sort -nr | head -n 5',
      points: 20,
      validationCriteria: {
        requiredElements: ['access.log', 'sort', 'uniq -c', 'head']
      },
      explanation: 'awk extracts first column, sort orders lines, uniq -c counts duplicates, and sort -nr head ranks top hits.'
    },
    {
      id: 'linux_q4',
      skill: 'Linux',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a systemd service unit file "/etc/systemd/system/myapp.service" that runs "/usr/bin/node /app/server.js" under user "www-data", restarts on failure with a 5-second restart delay.',
      starterCode: '[Unit]\nDescription=My Node App\nAfter=network.target\n\n[Service]\n',
      expectedAnswer: '[Unit]\nDescription=My Node App\nAfter=network.target\n\n[Service]\nUser=www-data\nWorkingDirectory=/app\nExecStart=/usr/bin/node /app/server.js\nRestart=on-failure\nRestartSec=5s\n\n[Install]\nWantedBy=multi-user.target',
      points: 20,
      validationCriteria: {
        requiredElements: ['[Service]', 'User=www-data', 'ExecStart=', 'Restart=on-failure', '[Install]']
      },
      explanation: 'systemd service units define daemon execution parameters and automatic restart lifecycles.'
    },
    {
      id: 'linux_q5',
      skill: 'Linux',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Describe how to diagnose a Linux server exhibiting high load average: what diagnostic commands (uptime, top/htop, vmstat, iostat, ss/lsof) isolate whether the bottleneck is CPU bound, disk I/O wait bound, or memory swapping?',
      starterCode: '# Linux Performance Diagnostics:\n# 1. High Load Average Meaning:\n# 2. CPU vs I/O vs Memory Bottleneck commands:\n',
      expectedAnswer: '1. Load average represents processes in R (running) and D (uninterruptible disk sleep) states. A load higher than CPU core count indicates queuing.\n2. Commands:\n- top/htop: Check %us (user CPU) vs %wa (I/O wait).\n- vmstat 1: Check "b" (blocked processes) and "si/so" (swap in/out) for memory pressure.\n- iostat -xz 1: Check %util and await to identify saturated disk devices.\n- ss -tulpn / lsof: Inspect network connections and open file descriptors.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Load average', 'top', 'vmstat', 'iostat', 'I/O wait']
      },
      explanation: 'Differentiating CPU saturation from disk I/O wait (%wa) is essential for Linux systems engineering.'
    }
  ],

  // ==========================================
  // 2. Computer Networks
  // ==========================================
  'Computer Networks': [
    {
      id: 'net_q1',
      skill: 'Computer Networks',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'List the 7 layers of the OSI model in order from Layer 1 (Physical) to Layer 7 (Application).',
      starterCode: '# 7 Layers of OSI Model:\n# Layer 1:\n# Layer 2:\n# Layer 3:\n# Layer 4:\n# Layer 5:\n# Layer 6:\n# Layer 7:\n',
      expectedAnswer: 'Layer 1: Physical\nLayer 2: Data Link\nLayer 3: Network\nLayer 4: Transport\nLayer 5: Session\nLayer 6: Presentation\nLayer 7: Application',
      points: 20,
      validationCriteria: {
        requiredElements: ['Physical', 'Data Link', 'Network', 'Transport', 'Session', 'Presentation', 'Application']
      },
      explanation: 'The 7-layer OSI conceptual framework standardizes telecommunication protocols.'
    },
    {
      id: 'net_q2',
      skill: 'Computer Networks',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Compare TCP and UDP: explain 3 key differences regarding connection establishment, reliability/ordering, and performance overhead.',
      starterCode: '# TCP vs UDP Comparison:\n# 1. Connection:\n# 2. Reliability & Ordering:\n# 3. Overhead & Use Cases:\n',
      expectedAnswer: '1. Connection: TCP is connection-oriented (3-way handshake SYN, SYN-ACK, ACK); UDP is connectionless.\n2. Reliability: TCP guarantees packet delivery and ordering via sequence numbers and retransmissions; UDP provides best-effort delivery without ordering or retransmission guarantees.\n3. Overhead: TCP has higher header overhead and congestion control latency; UDP is lightweight and ideal for real-time video/gaming/DNS.',
      points: 20,
      validationCriteria: {
        requiredElements: ['connection-oriented', 'connectionless', '3-way handshake', 'reliability', 'UDP']
      },
      explanation: 'TCP prioritizes reliable in-order delivery; UDP prioritizes low latency and minimal overhead.'
    },
    {
      id: 'net_q3',
      skill: 'Computer Networks',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain the TCP 3-Way Handshake (SYN, SYN-ACK, ACK) and 4-Way Handshake for connection termination (FIN, ACK, FIN, ACK).',
      starterCode: '# TCP Handshakes:\n# 1. Establishment (3-way):\n# 2. Teardown (4-way):\n',
      expectedAnswer: 'Establishment (3-way):\n1. Client -> Server: SYN (with initial sequence number seq=x)\n2. Server -> Client: SYN-ACK (ack=x+1, seq=y)\n3. Client -> Server: ACK (ack=y+1)\nTeardown (4-way):\n1. Active closer -> Passive: FIN\n2. Passive -> Active: ACK\n3. Passive -> Active: FIN\n4. Active -> Passive: ACK (enters TIME_WAIT to ensure final ACK is received)',
      points: 20,
      validationCriteria: {
        requiredElements: ['SYN', 'SYN-ACK', 'ACK', 'FIN', 'TIME_WAIT']
      },
      explanation: 'Handshakes synchronize initial sequence numbers and coordinate graceful state teardown.'
    },
    {
      id: 'net_q4',
      skill: 'Computer Networks',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Explain DNS (Domain Name System) resolution flow from client browser to root name servers, TLD servers, authoritative nameservers, and explain the role of TTL (Time To Live).',
      starterCode: '# DNS Resolution Workflow:\n# 1. Local cache / Resolver:\n# 2. Root & TLD Servers:\n# 3. Authoritative Nameserver:\n# 4. TTL Role:\n',
      expectedAnswer: '1. Browser checks local cache and OS resolver cache; if missing, queries Recursive Resolver.\n2. Recursive Resolver queries Root Nameserver (.), which refers it to the Top-Level Domain (TLD) server (.com).\n3. TLD server refers resolver to the domain\'s Authoritative Nameserver, which returns the actual IP address (A/AAAA record).\n4. TTL specifies duration in seconds recursive caches may cache the record before making fresh queries.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Recursive', 'Root', 'TLD', 'Authoritative', 'TTL']
      },
      explanation: 'Hierarchical distributed DNS infrastructure translates human domain names to routable IP addresses.'
    },
    {
      id: 'net_q5',
      skill: 'Computer Networks',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain how HTTPS and TLS 1.3 Handshake work: describe asymmetric key exchange (ECDHE), symmetric session encryption (AES-GCM), and digital certificate authentication via Certificate Authorities (CAs).',
      starterCode: '# HTTPS / TLS 1.3 Architecture:\n# 1. Certificate Validation:\n# 2. Key Exchange (ECDHE):\n# 3. Symmetric Encryption:\n',
      expectedAnswer: '1. Server presents its X.509 certificate signed by a trusted CA; client validates certificate signature chain against local root store.\n2. In a 1-RTT handshake, client and server use Elliptic Curve Diffie-Hellman Ephemeral (ECDHE) key exchange over public channels to derive identical shared symmetric secret keys without transmitting keys.\n3. All subsequent application HTTP data is encrypted using high-speed symmetric ciphers (e.g. AES-GCM or ChaCha20-Poly1305) ensuring confidentiality, integrity, and forward secrecy.',
      points: 20,
      validationCriteria: {
        requiredElements: ['X.509', 'CA', 'ECDHE', 'symmetric', 'AES', 'forward secrecy']
      },
      explanation: 'TLS pairs asymmetric cryptography for identity and key exchange with symmetric ciphers for fast bulk encryption.'
    }
  ],

  // ==========================================
  // 3. Operating Systems
  // ==========================================
  'Operating Systems': [
    {
      id: 'os_q1',
      skill: 'Operating Systems',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Explain the fundamental differences between a Process and a Thread in modern operating systems regarding address space, resources, and context switching overhead.',
      starterCode: '# Process vs Thread:\n# 1. Address space & Memory:\n# 2. Resources:\n# 3. Context switch overhead:\n',
      expectedAnswer: '1. Process: An independent executing program with its own dedicated virtual address space (heap, stack, data, text). Threads within a process share the same address space and heap, but maintain independent stacks and registers.\n2. Resources: Processes have independent file descriptors and security tokens; threads share process resources.\n3. Overhead: Context switching between processes requires invalidating CPU TLB and memory map tables; thread context switching only saves registers/stack, making it substantially faster.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Process', 'Thread', 'address space', 'stack', 'TLB', 'Context switch']
      },
      explanation: 'Processes provide memory isolation boundaries; threads provide lightweight concurrent execution within a process.'
    },
    {
      id: 'os_q2',
      skill: 'Operating Systems',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'List the 4 Coffman conditions required for a Deadlock to occur in an operating system, and explain how eliminating any single condition prevents deadlocks.',
      starterCode: '# 4 Coffman Deadlock Conditions:\n# 1.\n# 2.\n# 3.\n# 4.\n',
      expectedAnswer: '1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.\n2. Hold and Wait: A process holds at least one resource and is waiting to acquire additional resources held by others.\n3. No Preemption: Resources cannot be forcibly confiscated from processes.\n4. Circular Wait: A closed chain of processes exists where each process waits for a resource held by the next.\nBreaking any one of these conditions prevents deadlocks.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait']
      },
      explanation: 'Coffman conditions mathematically formalize the prerequisites for multi-resource deadlocks.'
    },
    {
      id: 'os_q3',
      skill: 'Operating Systems',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain Virtual Memory and Paging: define Page, Frame, Page Table, Page Fault, and the role of the TLB (Translation Lookaside Buffer).',
      starterCode: '# Virtual Memory & Paging:\n# Page vs Frame:\n# Page Table & Page Fault:\n# TLB Function:\n',
      expectedAnswer: 'Page: Fixed-size contiguous block of virtual memory (typically 4KB).\nFrame: Corresponding fixed-size block of physical RAM.\nPage Table: Hardware/OS data structure mapping virtual pages to physical frames.\nPage Fault: Exception triggered by the MMU when a program accesses a valid virtual page currently residing on disk rather than RAM.\nTLB: High-speed hardware cache on the CPU that stores recent virtual-to-physical address translations to bypass page table lookups.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Page', 'Frame', 'Page Table', 'Page Fault', 'TLB']
      },
      explanation: 'Virtual memory isolates process address spaces and provides illusion of contiguous memory backed by RAM and disk.'
    },
    {
      id: 'os_q4',
      skill: 'Operating Systems',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Compare CPU Scheduling Algorithms: First-Come-First-Serve (FCFS), Shortest Job First (SJF), Round Robin (RR), and Multi-Level Feedback Queue (MLFQ), noting which causes starvation.',
      starterCode: '# CPU Scheduling Algorithms Comparison:\n# FCFS:\n# SJF:\n# Round Robin:\n# MLFQ:\n# Starvation risks:\n',
      expectedAnswer: 'FCFS: Non-preemptive, suffers from convoy effect.\nSJF: Minimizes average waiting time but can cause starvation of long jobs.\nRound Robin (RR): Preemptive with fixed time quantum; prevents starvation and guarantees responsiveness for time-sharing.\nMLFQ: Multiple priority queues with dynamic aging where I/O bound jobs stay in high-priority queues and CPU-bound jobs drop to lower queues. Starvation in MLFQ/SJF is prevented by periodic priority boosting.',
      points: 20,
      validationCriteria: {
        requiredElements: ['FCFS', 'SJF', 'Round Robin', 'MLFQ', 'starvation', 'time quantum']
      },
      explanation: 'Schedulers balance throughput, response time, turnaround time, and CPU utilization.'
    },
    {
      id: 'os_q5',
      skill: 'Operating Systems',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain Inter-Process Communication (IPC) mechanisms: Pipes, Message Queues, Shared Memory, and Unix Domain Sockets, comparing their throughput and synchronization requirements.',
      starterCode: '# IPC Mechanisms Comparison:\n# 1. Pipes (Anonymous/Named):\n# 2. Shared Memory:\n# 3. Message Queues:\n# 4. Unix Domain Sockets:\n# Throughput & Synchronization comparison:\n',
      expectedAnswer: '1. Pipes: Byte stream channels with FIFO semantics; anonymous pipes require parent-child hierarchy; named pipes (FIFOs) allow unrelated processes. Moderately fast, handled by kernel.\n2. Shared Memory: Fastest IPC because processes map the same physical RAM into their virtual address spaces, avoiding kernel copies. Requires explicit synchronization (mutexes/semaphores) to prevent race conditions.\n3. Message Queues: Kernel-managed discrete formatted message buffers.\n4. Unix Domain Sockets: Bidirectional socket-based communication within the same host with credential passing, offering high throughput and familiar network-like semantics.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Shared Memory', 'Pipes', 'Unix Domain Sockets', 'synchronization', 'semaphores']
      },
      explanation: 'Shared memory maximizes throughput but places responsibility for race-free synchronization on user space.'
    }
  ],

  // ==========================================
  // 4. Data Structures
  // ==========================================
  'Data Structures': [
    {
      id: 'ds_q1',
      skill: 'Data Structures',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Compare Arrays and Singly Linked Lists: provide the Time Complexity for Access, Search, Insertion (at beginning), and Deletion (at beginning) for both data structures.',
      starterCode: '# Arrays vs Linked Lists Big-O Complexity:\n# Array:\n#   Access: \n#   Search: \n#   Insert at head: \n#   Delete at head: \n# Linked List:\n#   Access: \n#   Search: \n#   Insert at head: \n#   Delete at head: \n',
      expectedAnswer: 'Array:\n  Access: O(1)\n  Search: O(n)\n  Insert at head: O(n) (requires shifting elements)\n  Delete at head: O(n)\nLinked List:\n  Access: O(n)\n  Search: O(n)\n  Insert at head: O(1)\n  Delete at head: O(1)',
      points: 20,
      validationCriteria: {
        requiredElements: ['O(1)', 'O(n)', 'Array', 'Linked List']
      },
      explanation: 'Arrays provide contiguous O(1) random access; linked lists provide O(1) head insertion/deletion without shifts.'
    },
    {
      id: 'ds_q2',
      skill: 'Data Structures',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Implement a Stack data structure using an array/list in JavaScript or Python supporting push(val), pop(), peek(), and isEmpty() with O(1) operations.',
      starterCode: 'class Stack {\n    constructor() {\n        this.items = [];\n    }\n    // Implement push, pop, peek, isEmpty\n}',
      expectedAnswer: 'class Stack {\n    constructor() {\n        this.items = [];\n    }\n    push(val) {\n        this.items.push(val);\n    }\n    pop() {\n        return this.items.pop();\n    }\n    peek() {\n        return this.items[this.items.length - 1];\n    }\n    isEmpty() {\n        return this.items.length === 0;\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['push(val)', 'pop()', 'peek()', 'isEmpty()']
      },
      explanation: 'Stacks follow LIFO (Last In, First Out) semantics with constant-time push and pop.'
    },
    {
      id: 'ds_q3',
      skill: 'Data Structures',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain Hash Tables and Collision Resolution: describe Separate Chaining vs Open Addressing (Linear Probing), and explain the impact of Load Factor on performance.',
      starterCode: '# Hash Tables & Collision Resolution:\n# 1. Hash Function & Collisions:\n# 2. Separate Chaining:\n# 3. Open Addressing (Linear Probing):\n# 4. Load Factor & Resizing:\n',
      expectedAnswer: '1. A hash function maps keys to array buckets. Collisions occur when two distinct keys produce identical bucket indices.\n2. Separate Chaining: Each bucket holds a linked list of entries that hashed to that bucket.\n3. Open Addressing: On collision, the algorithm probes sequentially (linear probing) or quadratically for the next unoccupied bucket in the array.\n4. Load Factor (alpha = N / M): Measures fullness. When load factor exceeds a threshold (typically 0.75), the table reallocates to a larger prime size and rehashes all elements to maintain average O(1) lookups.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Separate Chaining', 'Open Addressing', 'Linear Probing', 'Load Factor', 'O(1)']
      },
      explanation: 'Maintaining low load factors via dynamic resizing guarantees amortized O(1) hash table performance.'
    },
    {
      id: 'ds_q4',
      skill: 'Data Structures',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Explain Binary Search Trees (BST) and Self-Balancing Trees (AVL / Red-Black Trees): what is the worst-case time complexity of an un-balanced BST, and how do rotations maintain O(log n) height in balanced trees?',
      starterCode: '# BST vs Self-Balancing Trees:\n# 1. BST property & degenerate worst-case:\n# 2. AVL / Red-Black Tree balance mechanism & rotations:\n',
      expectedAnswer: '1. In a BST, left child < node < right child. If keys are inserted in sorted order, an unbalanced BST degenerates into a linked list with worst-case O(n) search and insertion.\n2. Self-balancing trees (AVL and Red-Black) enforce height or color constraints. Upon insertion or deletion that violates balance factors, they perform constant-time Tree Rotations (Left, Right, Left-Right, Right-Left) to restore height balance, guaranteeing worst-case O(log n) operations.',
      points: 20,
      validationCriteria: {
        requiredElements: ['BST', 'O(n)', 'Red-Black', 'AVL', 'Rotations', 'O(log n)']
      },
      explanation: 'Tree rotations restructure nodes locally in O(1) time to maintain logarithmic tree depth.'
    },
    {
      id: 'ds_q5',
      skill: 'Data Structures',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Implement a Binary Min-Heap class or describe its array representation (left child: 2i+1, right child: 2i+2, parent: (i-1)//2), explaining the heapifyUp and heapifyDown algorithms for O(log n) insert and extractMin().',
      starterCode: '# Min-Heap Array Representation & Algorithms:\n# Array indexing rules:\n# insert & heapifyUp logic:\n# extractMin & heapifyDown logic:\n',
      expectedAnswer: 'Array representation: For index i, left child is 2i+1, right child is 2i+2, parent is floor((i-1)/2).\ninsert(val): Append val to array end and invoke heapifyUp, swapping with parent as long as val < parent (O(log n)).\nextractMin(): Swap root with the last array element, pop last element, and invoke heapifyDown on root, swapping with the smaller of its children until min-heap property is restored (O(log n)).',
      points: 20,
      validationCriteria: {
        requiredElements: ['2i+1', '2i+2', 'heapifyUp', 'heapifyDown', 'extractMin', 'O(log n)']
      },
      explanation: 'Binary heaps implement Priority Queues compactly in contiguous arrays without pointer overhead.'
    }
  ],

  // ==========================================
  // 5. Algorithms
  // ==========================================
  'Algorithms': [
    {
      id: 'algo_q1',
      skill: 'Algorithms',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write an iterative Binary Search algorithm in Python or JavaScript that searches for target in a sorted array, returning its index or -1 if not found with O(log n) time complexity.',
      starterCode: 'function binarySearch(arr, target) {\n    let left = 0, right = arr.length - 1;\n    // Binary search logic\n    \n}',
      expectedAnswer: 'function binarySearch(arr, target) {\n    let left = 0, right = arr.length - 1;\n    while (left <= right) {\n        const mid = Math.floor((left + right) / 2);\n        if (arr[mid] === target) return mid;\n        if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['binarySearch', 'while (left <= right)', 'mid =', 'return mid', 'return -1']
      },
      explanation: 'Binary search halves the search space on each iteration, achieving O(log n) lookup.'
    },
    {
      id: 'algo_q2',
      skill: 'Algorithms',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Explain and implement Merge Sort: explain the Divide-and-Conquer strategy and why Merge Sort guarantees O(n log n) time complexity in all cases (best, average, worst).',
      starterCode: '# Merge Sort Divide & Conquer:\n# Merge implementation:\n',
      expectedAnswer: 'Divide: Recursively split array into halves until subarrays have length 1 (log n division levels).\nConquer: Merge two sorted halves in linear O(n) time by comparing pointers.\nBecause division always produces a balanced binary decomposition tree of depth log n and merging each level takes O(n) work, Merge Sort guarantees strictly O(n log n) runtime across all cases.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Divide and Conquer', 'Merge Sort', 'O(n log n)', 'recursion']
      },
      explanation: 'Merge sort provides stable O(n log n) sorting at the expense of O(n) auxiliary space.'
    },
    {
      id: 'algo_q3',
      skill: 'Algorithms',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Implement Breadth-First Search (BFS) and Depth-First Search (DFS) for graph traversal: which uses a Queue vs Stack/Recursion, and what are their respective use cases (e.g. shortest path in unweighted graphs)?',
      starterCode: '# BFS vs DFS Traversal:\n# BFS Data Structure & Use Case:\n# DFS Data Structure & Use Case:\n',
      expectedAnswer: 'BFS: Uses a FIFO Queue. Explores neighbors level by level. Ideal for finding the shortest path in unweighted graphs.\nDFS: Uses a LIFO Stack or recursion. Explores as deep as possible along each branch before backtracking. Ideal for topological sorting, cycle detection, and solving mazes.',
      points: 20,
      validationCriteria: {
        requiredElements: ['BFS', 'DFS', 'Queue', 'Stack', 'shortest path', 'unweighted']
      },
      explanation: 'BFS guarantees shortest hop count in unweighted graphs; DFS is optimal for exhaustive pathfinding.'
    },
    {
      id: 'algo_q4',
      skill: 'Algorithms',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Solve the 0/1 Knapsack problem using Dynamic Programming (DP): define the DP state dp[i][w] representing max value with i items and capacity w, and write the state transition relation.',
      starterCode: '# 0/1 Knapsack DP State and Transition:\n# State definition:\n# Transition relation:\n',
      expectedAnswer: 'State: dp[i][w] = maximum value achievable using a subset of the first i items with a maximum weight capacity w.\nTransition:\nIf weight[i-1] > w:\n  dp[i][w] = dp[i-1][w] (item cannot fit)\nElse:\n  dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i-1]] + value[i-1]) (choose max between excluding and including item).',
      points: 20,
      validationCriteria: {
        requiredElements: ['dp[i][w]', 'weight', 'value', 'max(']
      },
      explanation: 'Dynamic programming eliminates overlapping subproblem re-computation via memoization/tabulation.'
    },
    {
      id: 'algo_q5',
      skill: 'Algorithms',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain Dijkstra\'s algorithm for single-source shortest paths in a directed graph with non-negative edge weights: describe how a Priority Queue (Min-Heap) achieves O((V + E) log V) time complexity.',
      starterCode: '# Dijkstra\'s Shortest Path Algorithm:\n# Algorithm steps with Min-Heap:\n# Time complexity explanation:\n',
      expectedAnswer: '1. Initialize distances from start to all vertices as infinity, start vertex distance as 0. Push (0, start) into Min-Heap.\n2. While heap is not empty, pop the vertex u with minimum distance dist[u].\n3. For each neighbor v of u with edge weight w: if dist[u] + w < dist[v], relax the edge (update dist[v] = dist[u] + w) and push (dist[v], v) into the heap.\nTime complexity: Each vertex is extracted from the heap once (V log V) and each edge is examined once to update distances (E log V), yielding O((V + E) log V).',
      points: 20,
      validationCriteria: {
        requiredElements: ['Dijkstra', 'Min-Heap', 'Priority Queue', 'dist[u] + w', 'relax', 'O((V + E) log V)']
      },
      explanation: 'Greedy edge relaxation guided by a priority queue yields optimal shortest paths in weighted DAGs.'
    }
  ],

  // ==========================================
  // 6. OOP
  // ==========================================
  'OOP': [
    {
      id: 'oop_q1',
      skill: 'OOP',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Explain the four fundamental pillars of Object-Oriented Programming (OOP): Encapsulation, Abstraction, Inheritance, and Polymorphism with a concise definition for each.',
      starterCode: '# The 4 Pillars of OOP:\n# 1. Encapsulation:\n# 2. Abstraction:\n# 3. Inheritance:\n# 4. Polymorphism:\n',
      expectedAnswer: '1. Encapsulation: Bundling data (attributes) and methods that operate on that data into a single unit (class), hiding internal state through access modifiers.\n2. Abstraction: Hiding internal implementation complexities and exposing only high-level conceptual interfaces to the caller.\n3. Inheritance: Mechanism where a child class acquires fields and behaviors from a parent class, promoting code reuse.\n4. Polymorphism: Ability of different classes to respond to the same method call in their own specialized way (compile-time overloading or runtime overriding).',
      points: 20,
      validationCriteria: {
        requiredElements: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism']
      },
      explanation: 'The four pillars establish structural modularity, contracts, reuse, and dynamic polymorphism.'
    },
    {
      id: 'oop_q2',
      skill: 'OOP',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Explain the principle of "Composition over Inheritance": why is composing objects with interfaces/references more flexible than deep inheritance hierarchies?',
      starterCode: '# Composition over Inheritance:\n# Fragile base class problem:\n# Flexibility of composition:\n',
      expectedAnswer: 'Deep inheritance hierarchies create tight coupling ("is-a" relationship); modifying a base class risks breaking derived subclasses (fragile base class problem), and languages rarely support multiple inheritance cleanly.\nComposition ("has-a" relationship) embeds references to objects implementing interfaces, allowing behaviors to be swapped dynamically at runtime without modifying class hierarchies.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Composition', 'Inheritance', 'is-a', 'has-a', 'coupling']
      },
      explanation: 'Composition decouples components and enables runtime polymorphism without rigid compile-time inheritance.'
    },
    {
      id: 'oop_q3',
      skill: 'OOP',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain the SOLID design principles: define what each letter in S-O-L-I-D stands for with a one-sentence rule for each.',
      starterCode: '# SOLID Principles:\n# S:\n# O:\n# L:\n# I:\n# D:\n',
      expectedAnswer: 'S - Single Responsibility Principle (SRP): A class should have one, and only one, reason to change.\nO - Open/Closed Principle (OCP): Software entities should be open for extension, but closed for modification.\nL - Liskov Substitution Principle (LSP): Subtypes must be substitutable for their base types without altering correctness.\nI - Interface Segregation Principle (ISP): Clients should not be forced to depend on interfaces they do not use.\nD - Dependency Inversion Principle (DIP): High-level modules should depend on abstractions, not on concrete implementations.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Interface Segregation', 'Dependency Inversion']
      },
      explanation: 'SOLID principles guide software engineering toward decoupled, testable, maintainable systems.'
    },
    {
      id: 'oop_q4',
      skill: 'OOP',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Factory Pattern implementation or Strategy Pattern implementation in Python, Java, or JavaScript that allows dynamic creation or execution of payment processors (PayPal, Stripe, CreditCard).',
      starterCode: '// Strategy Pattern for Payment Processors:\n',
      expectedAnswer: 'class PaymentStrategy {\n  pay(amount) { throw new Error("Method not implemented"); }\n}\nclass PayPalPayment extends PaymentStrategy {\n  pay(amount) { return `Paid $${amount} via PayPal`; }\n}\nclass StripePayment extends PaymentStrategy {\n  pay(amount) { return `Paid $${amount} via Stripe`; }\n}\nclass ShoppingCart {\n  setPaymentMethod(strategy) { this.strategy = strategy; }\n  checkout(amount) { return this.strategy.pay(amount); }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['class PayPal', 'class Stripe', 'pay(amount)', 'strategy']
      },
      explanation: 'Strategy and Factory patterns encapsulate interchangeable algorithms and instantiation behind contracts.'
    },
    {
      id: 'oop_q5',
      skill: 'OOP',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Implement the Observer Design Pattern with a Subject class (attach, detach, notify) and Observer interfaces, demonstrating decoupled event broadcasting to multiple subscribers.',
      starterCode: '// Observer Pattern Implementation:\n',
      expectedAnswer: 'class Subject {\n  constructor() { this.observers = []; }\n  attach(observer) { this.observers.push(observer); }\n  detach(observer) { this.observers = this.observers.filter(obs => obs !== observer); }\n  notify(data) { this.observers.forEach(obs => obs.update(data)); }\n}\nclass ConcreteObserver {\n  constructor(name) { this.name = name; }\n  update(data) { console.log(`${this.name} received update: ${data}`); }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['class Subject', 'attach', 'detach', 'notify', 'update(data)']
      },
      explanation: 'Observer pattern defines one-to-many event dependency without tight coupling between subjects and subscribers.'
    }
  ],

  // ==========================================
  // 7. System Design
  // ==========================================
  'System Design': [
    {
      id: 'sys_q1',
      skill: 'System Design',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Explain Horizontal Scaling vs Vertical Scaling: define both, and explain why horizontal scaling provides higher fault tolerance for distributed web architectures.',
      starterCode: '# Horizontal vs Vertical Scaling:\n# Vertical Scaling (Scale Up):\n# Horizontal Scaling (Scale Out):\n# Fault tolerance advantages of Horizontal:\n',
      expectedAnswer: 'Vertical Scaling (Scale Up): Adding more hardware resources (CPU, RAM, SSD) to a single machine. Limited by hardware ceilings and introduces a single point of failure.\nHorizontal Scaling (Scale Out): Adding more machine instances to an architecture pool behind a load balancer.\nFault tolerance advantage: If a single machine crashes in a horizontally scaled system, the load balancer reroutes traffic to healthy remaining instances with zero downtime.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Horizontal Scaling', 'Vertical Scaling', 'single point of failure', 'load balancer', 'fault tolerance']
      },
      explanation: 'Horizontal scaling removes hardware ceilings and eliminates single points of failure.'
    },
    {
      id: 'sys_q2',
      skill: 'System Design',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Explain the CAP Theorem in distributed data stores: define Consistency, Availability, and Partition Tolerance, and explain why a distributed system can only guarantee two in the presence of network partitions.',
      starterCode: '# CAP Theorem:\n# Consistency (C):\n# Availability (A):\n# Partition Tolerance (P):\n# Tradeoff during network partition:\n',
      expectedAnswer: 'Consistency: Every read receives the most recent write or an error.\nAvailability: Every non-failing node returns a response for every request without error guarantee.\nPartition Tolerance: System continues functioning despite arbitrary network message loss or network partitions between nodes.\nTradeoff: Network partitions (P) are inevitable in real networks. When a partition occurs, the system must choose between CP (rejecting writes/reads to preserve consistency) or AP (accepting writes on both sides of partition, sacrificing global consistency).',
      points: 20,
      validationCriteria: {
        requiredElements: ['Consistency', 'Availability', 'Partition Tolerance', 'network partition', 'CP', 'AP']
      },
      explanation: 'CAP theorem formalizes the fundamental tradeoff between consistency and availability over fallible networks.'
    },
    {
      id: 'sys_q3',
      skill: 'System Design',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain Caching Strategies in System Design: compare Cache-Aside, Write-Through, and Write-Back (Write-Behind), discussing data consistency and write latency tradeoffs.',
      starterCode: '# Caching Strategies:\n# 1. Cache-Aside (Lazy Loading):\n# 2. Write-Through:\n# 3. Write-Back (Write-Behind):\n',
      expectedAnswer: '1. Cache-Aside: Application reads from cache; on cache miss, reads from DB and updates cache. Writes update DB and invalidate cache.\n2. Write-Through: Data is written synchronously to cache AND database simultaneously before confirming success. Guarantees consistency but increases write latency.\n3. Write-Back (Write-Behind): Data is written directly to cache and acknowledged immediately; an asynchronous worker writes batched changes to DB later. Minimizes write latency but risks data loss if cache fails before flushing.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Cache-Aside', 'Write-Through', 'Write-Back', 'consistency', 'latency']
      },
      explanation: 'Caching strategies balance read/write latency against cache invalidation complexity.'
    },
    {
      id: 'sys_q4',
      skill: 'System Design',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Design a scalable URL Shortener service (like bit.ly): describe the database schema, Base62 encoding of 64-bit auto-incrementing IDs vs hashing (MD5/SHA256), and caching layer sizing.',
      starterCode: '# URL Shortener System Design:\n# 1. Database Schema:\n# 2. Short URL Generation (Base62 vs Hash):\n# 3. Redirection & Caching Architecture:\n',
      expectedAnswer: '1. Schema: Table "urls" (id BIGINT PRIMARY KEY, original_url TEXT, short_code VARCHAR(10) UNIQUE, user_id BIGINT, created_at TIMESTAMP).\n2. Generation: Using a distributed unique ID generator (e.g. Snowflake 64-bit integer), encode the numeric ID into Base62 [0-9, a-z, A-Z]. A 7-character Base62 string yields 62^7 (~3.5 trillion) collision-free combinations without hash collision handling.\n3. Architecture: Cache hot URLs in Redis with LRU eviction. On incoming GET /{code}, check Redis first; on miss, query DB, write to Redis, and issue HTTP 302/301 redirect.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Base62', 'short_code', 'Redis', 'redirect', 'Snowflake']
      },
      explanation: 'Base62 encoding of sequential IDs guarantees collision-free compact alphanumeric URLs.'
    },
    {
      id: 'sys_q5',
      skill: 'System Design',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Design a distributed Rate Limiter: compare algorithms (Token Bucket, Leaky Bucket, Sliding Window Log, Sliding Window Counter), and explain how Redis and Lua scripts ensure atomic rate limiting across distributed API clusters.',
      starterCode: '# Distributed Rate Limiting System Design:\n# 1. Algorithms Comparison:\n# 2. Redis + Lua script implementation for atomic enforcement:\n',
      expectedAnswer: '1. Algorithms: Token Bucket allows bursts while capping average rate. Leaky Bucket smooths output to a constant rate. Sliding Window Counter divides time into micro-windows and interpolates past and current window counts, offering high accuracy with low memory footprint.\n2. Distributed Enforcement: In multi-server clusters, naive Redis GET then INCR causes race conditions. Using a Redis Lua script ensures the check-and-increment executes atomically on the Redis server in a single network round-trip, preventing race conditions without distributed locks.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Token Bucket', 'Sliding Window', 'Redis', 'Lua', 'atomically', 'race condition']
      },
      explanation: 'Redis Lua scripts execute atomically in the Redis thread, providing lock-free distributed rate limiting.'
    }
  ],

  // ==========================================
  // 8. Cybersecurity
  // ==========================================
  'Cybersecurity': [
    {
      id: 'sec_q1',
      skill: 'Cybersecurity',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Explain the CIA Triad in information security: define Confidentiality, Integrity, and Availability with a concrete security control for each.',
      starterCode: '# The CIA Triad:\n# 1. Confidentiality (Control):\n# 2. Integrity (Control):\n# 3. Availability (Control):\n',
      expectedAnswer: '1. Confidentiality: Ensuring sensitive data is accessible only to authorized personnel (Control: AES-256 encryption at rest, TLS in transit, RBAC).\n2. Integrity: Safeguarding the accuracy and completeness of data against unauthorized alteration (Control: SHA-256 cryptographic hashing, HMACs, digital signatures).\n3. Availability: Ensuring authorized users have reliable timely access to systems (Control: Redundant server clusters, DDoS mitigation, automated backups).',
      points: 20,
      validationCriteria: {
        requiredElements: ['Confidentiality', 'Integrity', 'Availability', 'encryption', 'hashing']
      },
      explanation: 'The CIA Triad forms the foundational benchmark for all security architecture policies.'
    },
    {
      id: 'sec_q2',
      skill: 'Cybersecurity',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Explain SQL Injection (SQLi): write an example of a vulnerable SQL query, explain how an attacker exploits it (e.g. "\' OR \'1\'=\'1"), and write the parameterized query fix.',
      starterCode: '# SQL Injection (SQLi):\n# Vulnerable code:\n# Exploitation payload:\n# Parameterized query fix:\n',
      expectedAnswer: 'Vulnerable code: f"SELECT * FROM users WHERE username = \'{user_input}\'"\nExploit: An attacker enters "\' OR \'1\'=\'1", transforming the query into "SELECT * FROM users WHERE username = \'\' OR \'1\'=\'1\'", returning all rows and bypassing auth.\nFix: Parameterized queries / prepared statements (e.g., cursor.execute("SELECT * FROM users WHERE username = %s", (user_input,))), which treat input strictly as literal values rather than executable SQL syntax.',
      points: 20,
      validationCriteria: {
        requiredElements: ['SQL Injection', 'parameterized', 'prepared statements', "'1'='1'"]
      },
      explanation: 'Parameterized queries separate SQL command parsing from user-supplied data variables.'
    },
    {
      id: 'sec_q3',
      skill: 'Cybersecurity',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Compare Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF): explain how Stored XSS executes malicious code and how CSRF tokens and SameSite cookies protect against CSRF attacks.',
      starterCode: '# XSS vs CSRF:\n# 1. Stored XSS Mechanism & Impact:\n# 2. CSRF Attack Mechanism:\n# 3. Defense (CSRF tokens & SameSite cookies):\n',
      expectedAnswer: 'Stored XSS: Attacker injects malicious JavaScript into a database (e.g. comment field). When victim views the page, the script executes in their browser context, stealing session cookies or tokens.\nCSRF: An unauthorized site tricks a victim\'s browser into submitting unwanted actions to a target site where the victim is authenticated.\nDefenses: Mitigate XSS with HTML output encoding and strict Content Security Policy (CSP). Mitigate CSRF by requiring unique cryptographically random CSRF tokens on state-changing requests and configuring cookies with SameSite=Strict or Lax.',
      points: 20,
      validationCriteria: {
        requiredElements: ['XSS', 'CSRF', 'SameSite', 'CSRF token', 'Content Security Policy']
      },
      explanation: 'XSS compromises execution integrity within the origin; CSRF exploits ambient browser authentication credentials.'
    },
    {
      id: 'sec_q4',
      skill: 'Cybersecurity',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Explain secure password storage: why are fast hash algorithms like MD5 or SHA-256 insecure for passwords, and how do adaptive hashing functions like bcrypt or Argon2 with salt and work factor protect against brute-force attacks?',
      starterCode: '# Secure Password Hashing:\n# 1. Why MD5/SHA-256 are insecure for passwords:\n# 2. Salt and Rainbow Tables:\n# 3. Adaptive algorithms (bcrypt / Argon2):\n',
      expectedAnswer: '1. MD5 and SHA-256 are fast cryptographic hashes designed for high throughput. GPUs can compute billions of SHA-256 hashes per second, making brute-force dictionary attacks trivial.\n2. A Salt (random cryptographic string appended to passwords before hashing) prevents precomputed Rainbow Table lookups.\n3. Adaptive hashing algorithms (bcrypt, Argon2) are deliberately computationally expensive and memory-hard. Their work factor (cost) can be tuned to resist hardware ASIC and GPU cracking.',
      points: 20,
      validationCriteria: {
        requiredElements: ['MD5', 'SHA-256', 'bcrypt', 'Argon2', 'salt', 'work factor']
      },
      explanation: 'Adaptive memory-hard password hashers increase computational cost to render brute-force cracking unfeasible.'
    },
    {
      id: 'sec_q5',
      skill: 'Cybersecurity',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the Principle of Least Privilege (PoLP) and Zero Trust Architecture ("never trust, always verify"): describe how mutual TLS (mTLS), micro-segmentation, and continuous identity verification replace traditional perimeter-based security.',
      starterCode: '# Zero Trust Architecture & Least Privilege:\n# 1. Principle of Least Privilege:\n# 2. "Never Trust, Always Verify" tenets:\n# 3. mTLS and Micro-segmentation:\n',
      expectedAnswer: '1. Principle of Least Privilege: Every user, process, and system entity is granted only the minimum permissions strictly necessary to perform its legitimate function.\n2. Zero Trust: Replaces castle-and-moat perimeter models by assuming threats exist both outside AND inside the network.\n3. Implementation: Service-to-service communication requires mutual TLS (mTLS) for cryptographic identity verification and encryption. Micro-segmentation restricts lateral movement between microservices, and dynamic contextual authorization verifies identity, device health, and telemetry on every request.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Least Privilege', 'Zero Trust', 'mTLS', 'Micro-segmentation', 'never trust, always verify']
      },
      explanation: 'Zero Trust eliminates implicit trust assumptions, validating identity and authorization on every transaction.'
    }
  ]
};
