/**
 * SkillProof Assessment Question Bank - Programming Languages
 * 
 * Skills:
 * 1. Python
 * 2. Java
 * 3. JavaScript
 * 4. TypeScript
 * 5. C
 * 6. C++
 * 7. C#
 * 8. Go
 * 9. Rust
 * 10. PHP
 * 11. Ruby
 * 12. Kotlin
 * 13. Swift
 * 
 * Strictly 5 questions per skill, progressive difficulty (Easy -> Easy/Med -> Med -> Med/Hard -> Hard).
 */

export const PROGRAMMING_QUESTIONS = {
  // ==========================================
  // 1. Python
  // ==========================================
  'Python': [
    {
      id: 'python_q1',
      skill: 'Python',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Python function "filter_even_squares(numbers)" that takes a list of integers and returns a new list containing the squares of all even numbers using list comprehension.',
      starterCode: 'def filter_even_squares(numbers):\n    # Return squares of even numbers\n    ',
      expectedAnswer: 'def filter_even_squares(numbers):\n    return [x**2 for x in numbers if x % 2 == 0]',
      points: 20,
      validationCriteria: {
        requiredElements: ['def filter_even_squares', 'return', '% 2 == 0']
      },
      explanation: 'List comprehension `[x**2 for x in numbers if x % 2 == 0]` concisely filters and transforms data.'
    },
    {
      id: 'python_q2',
      skill: 'Python',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a Python class "BankAccount" with an __init__ taking initial_balance (default 0), and methods deposit(amount) and withdraw(amount). If withdrawal exceeds balance, raise a ValueError("Insufficient funds").',
      starterCode: 'class BankAccount:\n    def __init__(self, initial_balance=0):\n        self.balance = initial_balance\n        \n    # Implement deposit and withdraw\n',
      expectedAnswer: 'class BankAccount:\n    def __init__(self, initial_balance=0):\n        self.balance = initial_balance\n\n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            raise ValueError("Insufficient funds")\n        self.balance -= amount\n        return self.balance',
      points: 20,
      validationCriteria: {
        requiredElements: ['class BankAccount', 'def deposit', 'def withdraw', 'ValueError', 'Insufficient funds']
      },
      explanation: 'Standard object-oriented programming in Python with state validation and exceptions.'
    },
    {
      id: 'python_q3',
      skill: 'Python',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a Python function "safe_read_json(filepath)" that opens a file using a context manager ("with open(...)"), parses JSON data, and safely handles both FileNotFoundError and json.JSONDecodeError, returning None if an error occurs.',
      starterCode: 'import json\n\ndef safe_read_json(filepath):\n    # Use context manager and try/except\n',
      expectedAnswer: 'import json\n\ndef safe_read_json(filepath):\n    try:\n        with open(filepath, "r", encoding="utf-8") as f:\n            return json.load(f)\n    except (FileNotFoundError, json.JSONDecodeError):\n        return None',
      points: 20,
      validationCriteria: {
        requiredElements: ['with open', 'json.load', 'except', 'FileNotFoundError']
      },
      explanation: 'Uses Python context managers to ensure file descriptor cleanup with targeted exception handling.'
    },
    {
      id: 'python_q4',
      skill: 'Python',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Python generator function "fibonacci_stream(limit)" using "yield" that yields Fibonacci numbers up to the specified limit (inclusive).',
      starterCode: 'def fibonacci_stream(limit):\n    a, b = 0, 1\n    # Yield numbers\n',
      expectedAnswer: 'def fibonacci_stream(limit):\n    a, b = 0, 1\n    while a <= limit:\n        yield a\n        a, b = b, a + b',
      points: 20,
      validationCriteria: {
        requiredElements: ['def fibonacci_stream', 'yield', 'while']
      },
      explanation: 'Generators yield values on demand, maintaining constant memory overhead during iteration.'
    },
    {
      id: 'python_q5',
      skill: 'Python',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a custom Python decorator "@retry(max_attempts=3, delay=1)" that catches any Exception raised by the decorated function and retries it up to max_attempts before re-raising the exception.',
      starterCode: 'import time\nfrom functools import wraps\n\ndef retry(max_attempts=3, delay=1):\n    def decorator(func):\n        @wraps(func)\n        def wrapper(*args, **kwargs):\n            # Retry logic\n            pass\n        return wrapper\n    return decorator',
      expectedAnswer: 'import time\nfrom functools import wraps\n\ndef retry(max_attempts=3, delay=1):\n    def decorator(func):\n        @wraps(func)\n        def wrapper(*args, **kwargs):\n            attempts = 0\n            while attempts < max_attempts:\n                try:\n                    return func(*args, **kwargs)\n                except Exception as e:\n                    attempts += 1\n                    if attempts >= max_attempts:\n                        raise e\n                    time.sleep(delay)\n        return wrapper\n    return decorator',
      points: 20,
      validationCriteria: {
        requiredElements: ['@wraps(func)', 'def wrapper', 'max_attempts', 'time.sleep', 'raise']
      },
      explanation: 'Parameterized decorator utilizing closures, functools.wraps, and resilient exception handling.'
    }
  ],

  // ==========================================
  // 2. Java
  // ==========================================
  'Java': [
    {
      id: 'java_q1',
      skill: 'Java',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Java method "public static int sumArray(int[] numbers)" that calculates and returns the sum of all elements in the given array.',
      starterCode: 'public class Solution {\n    public static int sumArray(int[] numbers) {\n        // Calculate sum\n        \n    }\n}',
      expectedAnswer: 'public class Solution {\n    public static int sumArray(int[] numbers) {\n        int sum = 0;\n        for (int n : numbers) {\n            sum += n;\n        }\n        return sum;\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['public static int sumArray', 'sum +=', 'return sum']
      },
      explanation: 'Iterates through primitive array elements calculating an accumulated integer sum.'
    },
    {
      id: 'java_q2',
      skill: 'Java',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a Java class "Employee" with private fields id (int), name (String), and salary (double), with a constructor and standard getter and setter methods.',
      starterCode: 'public class Employee {\n    private int id;\n    private String name;\n    private double salary;\n    // Constructor and getters/setters\n}',
      expectedAnswer: 'public class Employee {\n    private int id;\n    private String name;\n    private double salary;\n\n    public Employee(int id, String name, double salary) {\n        this.id = id;\n        this.name = name;\n        this.salary = salary;\n    }\n\n    public int getId() { return id; }\n    public String getName() { return name; }\n    public double getSalary() { return salary; }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['private int id', 'private String name', 'public Employee', 'getId()', 'getSalary()']
      },
      explanation: 'Demonstrates Java encapsulation, field privacy, and constructor initialization.'
    },
    {
      id: 'java_q3',
      skill: 'Java',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Using Java Streams (Java 8+), write a method "public static List<String> getFilteredNames(List<String> names)" that filters out names with length < 4, converts remaining names to uppercase, and collects them into a List.',
      starterCode: 'import java.util.*;\nimport java.util.stream.Collectors;\n\npublic class Solution {\n    public static List<String> getFilteredNames(List<String> names) {\n        // Use streams\n        \n    }\n}',
      expectedAnswer: 'public class Solution {\n    public static List<String> getFilteredNames(List<String> names) {\n        return names.stream()\n                    .filter(name -> name.length() >= 4)\n                    .map(String::toUpperCase)\n                    .collect(Collectors.toList());\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['stream()', '.filter', '.map', 'Collectors.toList()']
      },
      explanation: 'Java Streams provide functional pipelines for filtering, mapping, and collecting collections.'
    },
    {
      id: 'java_q4',
      skill: 'Java',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Java method demonstrating try-with-resources that reads lines from a file using BufferedReader and FileReader, ensuring the reader is automatically closed.',
      starterCode: 'import java.io.*;\n\npublic class Solution {\n    public static void printFileLines(String filePath) throws IOException {\n        // Try-with-resources\n        \n    }\n}',
      expectedAnswer: 'public class Solution {\n    public static void printFileLines(String filePath) throws IOException {\n        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {\n            String line;\n            while ((line = reader.readLine()) != null) {\n                System.out.println(line);\n            }\n        }\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['try (BufferedReader', 'readLine()', 'while']
      },
      explanation: 'try-with-resources automatically closes resources implementing AutoCloseable without manual finally blocks.'
    },
    {
      id: 'java_q5',
      skill: 'Java',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a thread-safe Singleton class "ConfigurationManager" in Java using the Double-Checked Locking pattern with a private static volatile instance.',
      starterCode: 'public class ConfigurationManager {\n    private static volatile ConfigurationManager instance;\n    private ConfigurationManager() {}\n    // Implement getInstance() with double-checked locking\n}',
      expectedAnswer: 'public class ConfigurationManager {\n    private static volatile ConfigurationManager instance;\n    private ConfigurationManager() {}\n\n    public static ConfigurationManager getInstance() {\n        if (instance == null) {\n            synchronized (ConfigurationManager.class) {\n                if (instance == null) {\n                    instance = new ConfigurationManager();\n                }\n            }\n        }\n        return instance;\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['private static volatile', 'synchronized (ConfigurationManager.class)', 'instance == null']
      },
      explanation: 'Double-Checked Locking provides thread-safe lazy initialization with minimal synchronization overhead.'
    }
  ],

  // ==========================================
  // 3. JavaScript
  // ==========================================
  'JavaScript': [
    {
      id: 'js_q1',
      skill: 'JavaScript',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a JavaScript function "calculateCartTotal(items)" that takes an array of item objects [{ price: 10, quantity: 2 }, ...] and returns the total price using Array.prototype.reduce().',
      starterCode: 'function calculateCartTotal(items) {\n  // Use reduce\n  \n}',
      expectedAnswer: 'function calculateCartTotal(items) {\n  return items.reduce((total, item) => total + (item.price * item.quantity), 0);\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['function calculateCartTotal', 'reduce', 'item.price * item.quantity']
      },
      explanation: 'Array.prototype.reduce() accumulates values across array items with an initial accumulator of 0.'
    },
    {
      id: 'js_q2',
      skill: 'JavaScript',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write an asynchronous JavaScript function "fetchUserData(userId)" that uses fetch() with async/await, checks if response.ok is true (throwing an Error("Failed to fetch") otherwise), and returns parsed response.json().',
      starterCode: 'async function fetchUserData(userId) {\n  // Fetch and handle errors\n  \n}',
      expectedAnswer: 'async function fetchUserData(userId) {\n  const res = await fetch(`https://api.example.com/users/${userId}`);\n  if (!res.ok) {\n    throw new Error("Failed to fetch");\n  }\n  return await res.json();\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['async function fetchUserData', 'await fetch', 'res.ok', 'await res.json()']
      },
      explanation: 'Combines async/await with HTTP response status checks and JSON body decoding.'
    },
    {
      id: 'js_q3',
      skill: 'JavaScript',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a JavaScript "debounce(func, wait)" function that delays invoking func until after wait milliseconds have elapsed since the last time the debounced function was called.',
      starterCode: 'function debounce(func, wait) {\n  let timeoutId;\n  return function(...args) {\n    // Implement debounce\n    \n  };\n}',
      expectedAnswer: 'function debounce(func, wait) {\n  let timeoutId;\n  return function(...args) {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => {\n      func.apply(this, args);\n    }, wait);\n  };\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['clearTimeout(timeoutId)', 'setTimeout', 'func.apply', 'wait']
      },
      explanation: 'Debouncing limits execution frequency by resetting a timer on each invocation.'
    },
    {
      id: 'js_q4',
      skill: 'JavaScript',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a function "fetchAllSettled(urls)" that uses Promise.allSettled() to request multiple URLs concurrently, returning an array of resolved values and logging rejected errors.',
      starterCode: 'async function fetchAllSettled(urls) {\n  // Use Promise.allSettled\n  \n}',
      expectedAnswer: 'async function fetchAllSettled(urls) {\n  const promises = urls.map(url => fetch(url).then(r => r.json()));\n  const results = await Promise.allSettled(promises);\n  return results.map(r => r.status === "fulfilled" ? r.value : null);\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['Promise.allSettled', 'status === "fulfilled"']
      },
      explanation: 'Promise.allSettled executes promises in parallel without short-circuiting if any individual promise rejects.'
    },
    {
      id: 'js_q5',
      skill: 'JavaScript',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Implement a recursive "deepClone(obj)" function in JavaScript that handles nested objects, arrays, and primitive values without using JSON.parse(JSON.stringify()).',
      starterCode: 'function deepClone(obj) {\n  // Handle primitives, arrays, objects recursively\n  \n}',
      expectedAnswer: 'function deepClone(obj) {\n  if (obj === null || typeof obj !== "object") return obj;\n  if (Array.isArray(obj)) {\n    return obj.map(item => deepClone(item));\n  }\n  const copy = {};\n  for (const key of Object.keys(obj)) {\n    copy[key] = deepClone(obj[key]);\n  }\n  return copy;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['function deepClone', 'Array.isArray', 'Object.keys', 'deepClone(']
      },
      explanation: 'Deep cloning traverses nested data structures recursively to produce disconnected object copies.'
    }
  ],

  // ==========================================
  // 4. TypeScript
  // ==========================================
  'TypeScript': [
    {
      id: 'ts_q1',
      skill: 'TypeScript',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Define a TypeScript interface "User" with properties: id (number), name (string), email (string), and optional phoneNumber (string). Then write a typed function "formatUser(user: User): string".',
      starterCode: 'interface User {\n  // Define fields\n}\n\nfunction formatUser(user: User): string {\n  \n}',
      expectedAnswer: 'interface User {\n  id: number;\n  name: string;\n  email: string;\n  phoneNumber?: string;\n}\n\nfunction formatUser(user: User): string {\n  return `${user.name} (${user.email})`;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['interface User', 'id: number', 'name: string', 'phoneNumber?: string', 'function formatUser']
      },
      explanation: 'Defines typed interface contracts with required and optional properties.'
    },
    {
      id: 'ts_q2',
      skill: 'TypeScript',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a generic TypeScript function "getFirstElement<T>(arr: T[]): T | undefined" that returns the first element of an array or undefined if empty.',
      starterCode: 'function getFirstElement<T>(arr: T[]): T | undefined {\n  // Return first element\n  \n}',
      expectedAnswer: 'function getFirstElement<T>(arr: T[]): T | undefined {\n  return arr.length > 0 ? arr[0] : undefined;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['function getFirstElement<T>', 'arr: T[]', 'T | undefined', 'arr[0]']
      },
      explanation: 'Generics (<T>) allow type-safe operations across varying data types without losing type information.'
    },
    {
      id: 'ts_q3',
      skill: 'TypeScript',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Define a discriminated union type "Shape" for Circle (kind: "circle", radius: number) and Square (kind: "square", side: number), and implement a type-safe function "calculateArea(shape: Shape): number".',
      starterCode: 'type Circle = { kind: "circle"; radius: number };\ntype Square = { kind: "square"; side: number };\ntype Shape = Circle | Square;\n\nfunction calculateArea(shape: Shape): number {\n  // Use switch on shape.kind\n}',
      expectedAnswer: 'type Circle = { kind: "circle"; radius: number };\ntype Square = { kind: "square"; side: number };\ntype Shape = Circle | Square;\n\nfunction calculateArea(shape: Shape): number {\n  switch (shape.kind) {\n    case "circle":\n      return Math.PI * shape.radius * shape.radius;\n    case "square":\n      return shape.side * shape.side;\n  }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['type Shape', 'switch (shape.kind)', 'case "circle"', 'case "square"']
      },
      explanation: 'Discriminated unions enable exhaustive pattern matching and automatic type narrowing in TypeScript.'
    },
    {
      id: 'ts_q4',
      skill: 'TypeScript',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Demonstrate TypeScript utility types: create a type "UserUpdate" using Partial<Omit<User, "id">> from an existing User interface, allowing updates to any field except id.',
      starterCode: 'interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\n// Create UserUpdate type\n',
      expectedAnswer: 'type UserUpdate = Partial<Omit<User, "id">>;',
      points: 20,
      validationCriteria: {
        requiredElements: ['type UserUpdate', 'Partial', 'Omit<User, "id">']
      },
      explanation: 'Utility types Partial and Omit compose new type transformations from base interfaces.'
    },
    {
      id: 'ts_q5',
      skill: 'TypeScript',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a custom type guard function "isError(val: unknown): val is Error" that checks if val is non-null, an object, and has a message property of type string.',
      starterCode: 'function isError(val: unknown): val is Error {\n  // Type guard check\n  \n}',
      expectedAnswer: 'function isError(val: unknown): val is Error {\n  return val instanceof Error || (\n    typeof val === "object" &&\n    val !== null &&\n    "message" in val &&\n    typeof (val as Record<string, unknown>).message === "string"\n  );\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['val is Error', 'typeof val === "object"', 'val !== null']
      },
      explanation: 'Custom type guards using "val is TargetType" narrow unknown types safely within conditional blocks.'
    }
  ],

  // ==========================================
  // 5. C
  // ==========================================
  'C': [
    {
      id: 'c_q1',
      skill: 'C',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a C function "int string_length(const char* str)" that computes and returns the length of a null-terminated string without using strlen().',
      starterCode: 'int string_length(const char* str) {\n    // Compute length\n    \n}',
      expectedAnswer: 'int string_length(const char* str) {\n    int len = 0;\n    while (str[len] != \'\\0\') {\n        len++;\n    }\n    return len;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['int string_length', 'while', '\\0', 'return']
      },
      explanation: 'Iterates through char pointers until encountering the null terminator \'\\0\'.'
    },
    {
      id: 'c_q2',
      skill: 'C',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a C function "void swap(int* a, int* b)" using pointer dereferencing to swap the values of two integers in place.',
      starterCode: 'void swap(int* a, int* b) {\n    // Swap values\n    \n}',
      expectedAnswer: 'void swap(int* a, int* b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['void swap', '*a', '*b', 'temp']
      },
      explanation: 'Uses pointer dereferencing (*ptr) to mutate caller variables passed by reference.'
    },
    {
      id: 'c_q3',
      skill: 'C',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a C function "int* allocate_array(int size, int default_value)" that dynamically allocates an integer array with malloc(), initializes all elements to default_value, and handles allocation failures by returning NULL.',
      starterCode: '#include <stdlib.h>\n\nint* allocate_array(int size, int default_value) {\n    // Allocate and initialize\n    \n}',
      expectedAnswer: 'int* allocate_array(int size, int default_value) {\n    int* arr = (int*)malloc(size * sizeof(int));\n    if (arr == NULL) return NULL;\n    for (int i = 0; i < size; i++) {\n        arr[i] = default_value;\n    }\n    return arr;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['malloc(size * sizeof(int))', 'if (arr == NULL)', 'return arr']
      },
      explanation: 'Dynamic heap allocation with malloc requires calculating byte size and verifying allocation success.'
    },
    {
      id: 'c_q4',
      skill: 'C',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Define a singly linked list node struct "Node" with int data and struct Node* next, and write a function "void push_front(struct Node** head_ref, int new_data)" that prepends a node to the list.',
      starterCode: '#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node* next;\n};\n\nvoid push_front(struct Node** head_ref, int new_data) {\n    // Prepend node\n    \n}',
      expectedAnswer: 'struct Node {\n    int data;\n    struct Node* next;\n};\n\nvoid push_front(struct Node** head_ref, int new_data) {\n    struct Node* new_node = (struct Node*)malloc(sizeof(struct Node));\n    new_node->data = new_data;\n    new_node->next = *head_ref;\n    *head_ref = new_node;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['struct Node*', 'malloc(sizeof(struct Node))', 'new_node->next = *head_ref', '*head_ref = new_node']
      },
      explanation: 'Double pointers (struct Node**) permit modifying the caller\'s head pointer during list operations.'
    },
    {
      id: 'c_q5',
      skill: 'C',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the mechanism of buffer overflow vulnerabilities in C when using unsafe functions like strcpy() or gets(), and write the safe alternative implementation using strncpy() or snprintf().',
      starterCode: '// Unsafe buffer usage:\n// char buf[16];\n// strcpy(buf, untrusted_input);\n// Safe alternative and explanation:\n',
      expectedAnswer: 'Buffer overflow occurs when writing more bytes to a stack or heap buffer than allocated, overwriting adjacent memory and return addresses.\nSafe Alternative: snprintf(buf, sizeof(buf), "%s", untrusted_input); which enforces buffer boundary limits and guarantees null-termination.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Buffer overflow', 'snprintf', 'sizeof(buf)']
      },
      explanation: 'snprintf and strncpy guard against memory corruption by strictly limiting maximum written bytes.'
    }
  ],

  // ==========================================
  // 6. C++
  // ==========================================
  'C++': [
    {
      id: 'cpp_q1',
      skill: 'C++',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a C++ function "std::vector<int> filterPositives(const std::vector<int>& nums)" that uses a range-based for loop to return all positive numbers (> 0).',
      starterCode: '#include <vector>\n\nstd::vector<int> filterPositives(const std::vector<int>& nums) {\n    // Filter positives\n    \n}',
      expectedAnswer: 'std::vector<int> filterPositives(const std::vector<int>& nums) {\n    std::vector<int> result;\n    for (int n : nums) {\n        if (n > 0) result.push_back(n);\n    }\n    return result;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['std::vector<int>', 'for (int n : nums)', 'push_back', 'return result']
      },
      explanation: 'Range-based for loops iterate over STL containers cleanly by value or const reference.'
    },
    {
      id: 'cpp_q2',
      skill: 'C++',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a C++ class "Rectangle" with private double width and height, a parameterized constructor with member initializer list, and a const member function "double area() const".',
      starterCode: 'class Rectangle {\nprivate:\n    double width, height;\npublic:\n    // Constructor and area method\n};',
      expectedAnswer: 'class Rectangle {\nprivate:\n    double width, height;\npublic:\n    Rectangle(double w, double h) : width(w), height(h) {}\n    double area() const { return width * height; }\n};',
      points: 20,
      validationCriteria: {
        requiredElements: ['class Rectangle', ': width(w), height(h)', 'double area() const']
      },
      explanation: 'Member initializer lists avoid default construction and const qualifiers guarantee immutability.'
    },
    {
      id: 'cpp_q3',
      skill: 'C++',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write code demonstrating smart pointers in modern C++ (C++14/17): instantiate a std::unique_ptr<std::string> using std::make_unique, and transfer ownership to another unique_ptr using std::move.',
      starterCode: '#include <memory>\n#include <string>\n\nvoid smartPointerDemo() {\n    // Create and move unique_ptr\n    \n}',
      expectedAnswer: 'void smartPointerDemo() {\n    auto ptr1 = std::make_unique<std::string>("SkillProof");\n    std::unique_ptr<std::string> ptr2 = std::move(ptr1);\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['std::make_unique', 'std::unique_ptr', 'std::move']
      },
      explanation: 'std::unique_ptr enforces sole ownership of heap memory with move-only semantics, preventing leaks.'
    },
    {
      id: 'cpp_q4',
      skill: 'C++',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a generic C++ template function "template <typename T> T getMax(T a, T b)" and explain how template specialization or type deduction works.',
      starterCode: 'template <typename T>\nT getMax(T a, T b) {\n    // Return max\n    \n}',
      expectedAnswer: 'template <typename T>\nT getMax(T a, T b) {\n    return (a > b) ? a : b;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['template <typename T>', 'T getMax(T a, T b)', 'return (a > b) ? a : b']
      },
      explanation: 'C++ templates enable compile-time parametric polymorphism, generating optimized machine code per type.'
    },
    {
      id: 'cpp_q5',
      skill: 'C++',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the RAII (Resource Acquisition Is Initialization) idiom in C++ and describe the Rule of Five (Destructor, Copy Constructor, Copy Assignment, Move Constructor, Move Assignment).',
      starterCode: '// RAII and the Rule of Five:\n// 1. RAII Concept:\n// 2. The Five Member Functions:\n',
      expectedAnswer: '1. RAII ties resource lifetime (memory, sockets, mutexes) to object lifetime: acquire resource in constructor, release in destructor.\n2. Rule of Five states that if a class manages raw resources, it must explicitly implement or delete: Destructor, Copy Constructor, Copy Assignment, Move Constructor, and Move Assignment.',
      points: 20,
      validationCriteria: {
        requiredElements: ['RAII', 'destructor', 'Copy Constructor', 'Move Constructor', 'Rule of Five']
      },
      explanation: 'RAII guarantees deterministic resource cleanup upon exiting scope even when exceptions are thrown.'
    }
  ],

  // ==========================================
  // 7. C#
  // ==========================================
  'C#': [
    {
      id: 'csharp_q1',
      skill: 'C#',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a C# method "public static List<int> GetEvens(List<int> numbers)" using LINQ (.Where()) to filter and return all even numbers.',
      starterCode: 'using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\npublic class Solution {\n    public static List<int> GetEvens(List<int> numbers) {\n        // Use LINQ\n        \n    }\n}',
      expectedAnswer: 'public static List<int> GetEvens(List<int> numbers) {\n    return numbers.Where(n => n % 2 == 0).ToList();\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['Where', 'n % 2 == 0', 'ToList()']
      },
      explanation: 'LINQ extension methods provide declarative query syntax for IEnumerable collections.'
    },
    {
      id: 'csharp_q2',
      skill: 'C#',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a C# class "Product" with auto-implemented properties Id (int), Name (string), and Price (decimal), with an expression-bodied method "public override string ToString() => $\"{Name}: {Price:C}\";".',
      starterCode: 'public class Product {\n    // Properties and ToString\n}',
      expectedAnswer: 'public class Product {\n    public int Id { get; set; }\n    public string Name { get; set; }\n    public decimal Price { get; set; }\n\n    public override string ToString() => $"{Name}: {Price:C}";\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['public int Id { get; set; }', 'public decimal Price { get; set; }', 'public override string ToString()']
      },
      explanation: 'Auto-implemented properties reduce boilerplate in C# class definitions.'
    },
    {
      id: 'csharp_q3',
      skill: 'C#',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write an asynchronous C# method "public async Task<string> FetchUrlAsync(string url)" using HttpClient that calls GetStringAsync and handles exceptions gracefully.',
      starterCode: 'using System.Net.Http;\nusing System.Threading.Tasks;\n\npublic class WebService {\n    private static readonly HttpClient client = new HttpClient();\n    public async Task<string> FetchUrlAsync(string url) {\n        // Async HTTP call\n        \n    }\n}',
      expectedAnswer: 'public async Task<string> FetchUrlAsync(string url) {\n    try {\n        return await client.GetStringAsync(url);\n    } catch (HttpRequestException ex) {\n        return $"Error: {ex.Message}";\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['async Task<string>', 'await client.GetStringAsync', 'try', 'catch']
      },
      explanation: 'async/await pattern in C# leverages Task-based Asynchronous Pattern (TAP) for non-blocking I/O.'
    },
    {
      id: 'csharp_q4',
      skill: 'C#',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a C# class implementing IDisposable with the standard Dispose pattern, releasing unmanaged resources and suppressing finalization.',
      starterCode: 'using System;\n\npublic class ResourceHolder : IDisposable {\n    private bool _disposed = false;\n    \n    public void Dispose() {\n        // Dispose implementation\n    }\n}',
      expectedAnswer: 'public class ResourceHolder : IDisposable {\n    private bool _disposed = false;\n\n    public void Dispose() {\n        Dispose(true);\n        GC.SuppressFinalize(this);\n    }\n\n    protected virtual void Dispose(bool disposing) {\n        if (!_disposed) {\n            if (disposing) {\n                // Free managed resources\n            }\n            _disposed = true;\n        }\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['IDisposable', 'Dispose(true)', 'GC.SuppressFinalize(this)']
      },
      explanation: 'IDisposable provides explicit deterministic release of unmanaged resources in .NET.'
    },
    {
      id: 'csharp_q5',
      skill: 'C#',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a thread-safe cache lookup in C# using Lazy<T> or ConcurrentDictionary<string, string> with GetOrAdd() to ensure expensive value generation executes only once per key.',
      starterCode: 'using System;\nusing System.Collections.Concurrent;\n\npublic class ThreadSafeCache {\n    private readonly ConcurrentDictionary<string, string> _cache = new();\n    \n    public string GetOrCreate(string key, Func<string, string> factory) {\n        // Thread-safe fetch\n    }\n}',
      expectedAnswer: 'public class ThreadSafeCache {\n    private readonly ConcurrentDictionary<string, string> _cache = new();\n\n    public string GetOrCreate(string key, Func<string, string> factory) {\n        return _cache.GetOrAdd(key, factory);\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['ConcurrentDictionary', 'GetOrAdd(key, factory)']
      },
      explanation: 'ConcurrentDictionary.GetOrAdd() provides lock-free or fine-grained locked thread-safe operations in .NET.'
    }
  ],

  // ==========================================
  // 8. Go
  // ==========================================
  'Go': [
    {
      id: 'go_q1',
      skill: 'Go',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Go function "Divide(a, b float64) (float64, error)" that returns the quotient of a and b, or returns an error using fmt.Errorf("cannot divide by zero") if b is 0.',
      starterCode: 'package mathutil\nimport "fmt"\n\nfunc Divide(a, b float64) (float64, error) {\n    // Division logic\n    \n}',
      expectedAnswer: 'func Divide(a, b float64) (float64, error) {\n    if b == 0 {\n        return 0, fmt.Errorf("cannot divide by zero")\n    }\n    return a / b, nil\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['func Divide(a, b float64)', 'fmt.Errorf', 'cannot divide by zero', 'return a / b, nil']
      },
      explanation: 'Idiomatic Go error handling uses multiple return values (result, error) instead of exceptions.'
    },
    {
      id: 'go_q2',
      skill: 'Go',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Define a Go struct "User" with fields ID (int), Name (string), and Email (string) with json struct tags (`json:"id"`, etc.), and write a function to serialize it to JSON using json.Marshal.',
      starterCode: 'package user\nimport "encoding/json"\n\ntype User struct {\n    // Struct definition with json tags\n}\n\nfunc ToJSON(u User) ([]byte, error) {\n    // Marshal\n}',
      expectedAnswer: 'type User struct {\n    ID    int    `json:"id"`\n    Name  string `json:"name"`\n    Email string `json:"email"`\n}\n\nfunc ToJSON(u User) ([]byte, error) {\n    return json.Marshal(u)\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['type User struct', '`json:"id"`', 'json.Marshal(u)']
      },
      explanation: 'Go struct tags guide encoding/json reflection during serialization and deserialization.'
    },
    {
      id: 'go_q3',
      skill: 'Go',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a Go function demonstrating goroutines and channels: create a channel of integers, launch a goroutine that sends the squares of numbers 1 to 5 into the channel and closes it, and read all values from the channel using range.',
      starterCode: 'package main\n\nfunc produceSquares() []int {\n    ch := make(chan int)\n    // Goroutine and channel read\n}',
      expectedAnswer: 'func produceSquares() []int {\n    ch := make(chan int)\n    go func() {\n        for i := 1; i <= 5; i++ {\n            ch <- i * i\n        }\n        close(ch)\n    }()\n    var result []int\n    for sq := range ch {\n        result = append(result, sq)\n    }\n    return result\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['make(chan int)', 'go func()', 'close(ch)', 'for sq := range ch']
      },
      explanation: 'Goroutines and typed channels provide Go\'s CSP (Communicating Sequential Processes) concurrency model.'
    },
    {
      id: 'go_q4',
      skill: 'Go',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Go function using sync.WaitGroup to run 3 background tasks concurrently, ensuring the main function waits for all goroutines to finish before returning.',
      starterCode: 'package main\nimport "sync"\n\nfunc runTasksConcurrently() {\n    var wg sync.WaitGroup\n    // Run 3 tasks\n    \n}',
      expectedAnswer: 'func runTasksConcurrently() {\n    var wg sync.WaitGroup\n    for i := 0; i < 3; i++ {\n        wg.Add(1)\n        go func(id int) {\n            defer wg.Done()\n            // Do work\n        }(i)\n    }\n    wg.Wait()\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['var wg sync.WaitGroup', 'wg.Add(1)', 'defer wg.Done()', 'wg.Wait()']
      },
      explanation: 'sync.WaitGroup coordinates synchronization across concurrent goroutines.'
    },
    {
      id: 'go_q5',
      skill: 'Go',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a Go HTTP handler that uses context.WithTimeout(r.Context(), 2*time.Second) to cancel an outgoing database/external request if it takes longer than 2 seconds, handling ctx.Done() with http.StatusGatewayTimeout.',
      starterCode: 'package main\nimport (\n    "context"\n    "net/http"\n    "time"\n)\n\nfunc TimeoutHandler(w http.ResponseWriter, r *http.Request) {\n    // Context timeout\n}',
      expectedAnswer: 'func TimeoutHandler(w http.ResponseWriter, r *http.Request) {\n    ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)\n    defer cancel()\n\n    select {\n    case <-time.After(3 * time.Second):\n        w.Write([]byte("Success"))\n    case <-ctx.Done():\n        http.Error(w, "Request timed out", http.StatusGatewayTimeout)\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['context.WithTimeout', 'defer cancel()', 'case <-ctx.Done():', 'http.StatusGatewayTimeout']
      },
      explanation: 'Go Context propagates cancellation signals and timeouts across API boundaries and goroutines.'
    }
  ],

  // ==========================================
  // 9. Rust
  // ==========================================
  'Rust': [
    {
      id: 'rust_q1',
      skill: 'Rust',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Rust function "fn sum_even_numbers(numbers: &[i32]) -> i32" that iterates through a slice using an iterator, filtering even numbers and calculating their sum.',
      starterCode: 'pub fn sum_even_numbers(numbers: &[i32]) -> i32 {\n    // Iterator filter and sum\n    \n}',
      expectedAnswer: 'pub fn sum_even_numbers(numbers: &[i32]) -> i32 {\n    numbers.iter().filter(|&&x| x % 2 == 0).sum()\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['pub fn sum_even_numbers', '.iter()', '.filter', '.sum()']
      },
      explanation: 'Rust iterators are zero-cost abstractions compiling into optimized vectorization.'
    },
    {
      id: 'rust_q2',
      skill: 'Rust',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a Rust function "fn parse_and_double(s: &str) -> Result<i32, std::num::ParseIntError>" that parses a string slice to an integer and doubles it, utilizing the ? operator.',
      starterCode: 'use std::num::ParseIntError;\n\npub fn parse_and_double(s: &str) -> Result<i32, ParseIntError> {\n    // Use ? operator\n    \n}',
      expectedAnswer: 'pub fn parse_and_double(s: &str) -> Result<i32, ParseIntError> {\n    let val: i32 = s.trim().parse()?;\n    Ok(val * 2)\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['parse()?', 'Ok(val * 2)', 'Result<i32, ParseIntError>']
      },
      explanation: 'The ? operator in Rust unwraps Ok values or returns Err early from the enclosing function.'
    },
    {
      id: 'rust_q3',
      skill: 'Rust',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain Rust ownership and borrowing rules: what are the conditions regarding mutable vs immutable references (&T vs &mut T) to the same data within the same scope?',
      starterCode: '// Rust Borrowing Rules:\n// 1. References must always be valid.\n// 2. Mutable vs Immutable references rule:\n',
      expectedAnswer: 'In Rust, at any given time, you can have either one mutable reference (&mut T) OR any number of immutable references (&T) to a particular piece of data, but NEVER both simultaneously in the same scope. This guarantees data race freedom at compile time.',
      points: 20,
      validationCriteria: {
        requiredElements: ['one mutable reference', 'immutable references', 'compile time', 'data race']
      },
      explanation: 'The borrow checker prevents aliasing plus mutation, eliminating data races at compile time.'
    },
    {
      id: 'rust_q4',
      skill: 'Rust',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Rust enum "Message" with variants Quit, Move { x: i32, y: i32 }, and Write(String). Then write a function using match pattern matching to handle each variant.',
      starterCode: 'pub enum Message {\n    Quit,\n    Move { x: i32, y: i32 },\n    Write(String),\n}\n\npub fn process_message(msg: Message) {\n    // Match on msg\n}',
      expectedAnswer: 'pub enum Message {\n    Quit,\n    Move { x: i32, y: i32 },\n    Write(String),\n}\n\npub fn process_message(msg: Message) {\n    match msg {\n        Message::Quit => println!("Quit"),\n        Message::Move { x, y } => println!("Move to {}, {}", x, y),\n        Message::Write(text) => println!("Write: {}", text),\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['enum Message', 'match msg', 'Message::Quit', 'Message::Move']
      },
      explanation: 'Algebraic data types (enums) combined with exhaustive match statements form robust state machines in Rust.'
    },
    {
      id: 'rust_q5',
      skill: 'Rust',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Demonstrate thread-safe shared mutable state in Rust using Arc and Mutex (Arc<Mutex<T>>): spawn 3 threads that each lock the mutex and increment an integer counter by 1, and wait for them with join().',
      starterCode: 'use std::sync::{Arc, Mutex};\nuse std::thread;\n\npub fn run_concurrent_counter() -> i32 {\n    let counter = Arc::new(Mutex::new(0));\n    // Spawn threads and join\n}',
      expectedAnswer: 'pub fn run_concurrent_counter() -> i32 {\n    let counter = Arc::new(Mutex::new(0));\n    let mut handles = vec![];\n    for _ in 0..3 {\n        let counter_clone = Arc::clone(&counter);\n        handles.push(thread::spawn(move || {\n            let mut num = counter_clone.lock().unwrap();\n            *num += 1;\n        }));\n    }\n    for handle in handles { handle.join().unwrap(); }\n    let result = *counter.lock().unwrap();\n    result\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['Arc::new(Mutex::new(0))', 'Arc::clone', 'thread::spawn', 'lock().unwrap()']
      },
      explanation: 'Arc provides atomic reference counting across threads and Mutex ensures mutual exclusion.'
    }
  ],

  // ==========================================
  // 10. PHP
  // ==========================================
  'PHP': [
    {
      id: 'php_q1',
      skill: 'PHP',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a PHP function "calculateDiscount(float $price, float $percent): float" that calculates and returns the discounted price.',
      starterCode: '<?php\nfunction calculateDiscount(float $price, float $percent): float {\n    // Return discounted price\n    \n}',
      expectedAnswer: 'function calculateDiscount(float $price, float $percent): float {\n    return $price - ($price * ($percent / 100));\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['function calculateDiscount', 'float $price', 'return']
      },
      explanation: 'Modern PHP uses scalar type declarations and return type hints.'
    },
    {
      id: 'php_q2',
      skill: 'PHP',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a PHP class "User" with private properties $name and $email using PHP 8 Constructor Property Promotion, and a method getSummary(): string.',
      starterCode: '<?php\nclass User {\n    // Constructor property promotion\n    \n}',
      expectedAnswer: 'class User {\n    public function __construct(\n        private string $name,\n        private string $email\n    ) {}\n\n    public function getSummary(): string {\n        return "{$this->name} <{$this->email}>";\n    }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['public function __construct', 'private string $name', 'private string $email']
      },
      explanation: 'PHP 8 constructor property promotion eliminates repetitive property declarations and assignment.'
    },
    {
      id: 'php_q3',
      skill: 'PHP',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a PHP function using PDO with prepared statements to safely query an employee by email from a PostgreSQL/MySQL database, preventing SQL injection.',
      starterCode: '<?php\nfunction findUserByEmail(PDO $pdo, string $email): ?array {\n    // Prepare and execute\n}',
      expectedAnswer: 'function findUserByEmail(PDO $pdo, string $email): ?array {\n    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");\n    $stmt->execute([":email" => $email]);\n    $user = $stmt->fetch(PDO::FETCH_ASSOC);\n    return $user ?: null;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['$pdo->prepare', ':email', '$stmt->execute', 'fetch']
      },
      explanation: 'PDO prepared statements separate query structure from parameters, preventing SQL injection.'
    },
    {
      id: 'php_q4',
      skill: 'PHP',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a PHP script that sets the response header to "Content-Type: application/json; charset=utf-8", checks if $_SERVER["REQUEST_METHOD"] === "POST", and reads input with file_get_contents("php://input").',
      starterCode: '<?php\n// Set header and read JSON input\n',
      expectedAnswer: 'header("Content-Type: application/json; charset=utf-8");\nif ($_SERVER["REQUEST_METHOD"] !== "POST") {\n    http_response_code(405);\n    echo json_encode(["error" => "Method not allowed"]);\n    exit;\n}\n$rawData = file_get_contents("php://input");\n$data = json_decode($rawData, true);',
      points: 20,
      validationCriteria: {
        requiredElements: ['header("Content-Type: application/json', 'REQUEST_METHOD', 'php://input', 'json_decode']
      },
      explanation: 'php://input reads raw request body payloads essential for RESTful JSON APIs in PHP.'
    },
    {
      id: 'php_q5',
      skill: 'PHP',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the purpose and implementation of PSR-4 autoloading with Composer: how does a namespace like "App\\Services\\UserService" map to filesystem directory "src/Services/UserService.php"?',
      starterCode: '// PSR-4 Autoloading:\n// composer.json configuration:\n// Filesystem resolution:\n',
      expectedAnswer: 'In composer.json under "autoload": {"psr-4": {"App\\\\": "src/"}}, Composer registers an autoloader that replaces the namespace prefix "App\\" with base directory "src/", converts namespace separators (\\) to directory slashes (/), and appends ".php", loading src/Services/UserService.php automatically on demand.',
      points: 20,
      validationCriteria: {
        requiredElements: ['composer.json', 'psr-4', 'autoload', 'src/']
      },
      explanation: 'PSR-4 provides standardized namespace-to-filepath mapping for modular PHP package management.'
    }
  ],

  // ==========================================
  // 11. Ruby
  // ==========================================
  'Ruby': [
    {
      id: 'ruby_q1',
      skill: 'Ruby',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Ruby method "even_squares(numbers)" that takes an array of numbers and returns an array of the squares of even numbers using .select and .map.',
      starterCode: 'def even_squares(numbers)\n  # Use select and map\n  \nend',
      expectedAnswer: 'def even_squares(numbers)\n  numbers.select { |n| n.even? }.map { |n| n**2 }\nend',
      points: 20,
      validationCriteria: {
        requiredElements: ['def even_squares', 'select', 'even?', 'map']
      },
      explanation: 'Ruby\'s Enumerable module provides expressive chaining with blocks.'
    },
    {
      id: 'ruby_q2',
      skill: 'Ruby',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a Ruby class "Book" with attr_reader :title, :author, and an initialize method setting these instance variables.',
      starterCode: 'class Book\n  # attr_reader and initialize\n  \nend',
      expectedAnswer: 'class Book\n  attr_reader :title, :author\n\n  def initialize(title, author)\n    @title = title\n    @author = author\n  end\nend',
      points: 20,
      validationCriteria: {
        requiredElements: ['attr_reader', ':title', ':author', 'def initialize', '@title']
      },
      explanation: 'attr_reader automatically generates getter methods for instance variables (@var).'
    },
    {
      id: 'ruby_q3',
      skill: 'Ruby',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a custom Ruby method "time_it" that takes a block (using yield) and measures and prints the time in seconds taken to execute the block.',
      starterCode: 'def time_it\n  start_time = Time.now\n  # Yield to block and compute duration\nend',
      expectedAnswer: 'def time_it\n  start_time = Time.now\n  yield\n  duration = Time.now - start_time\n  puts "Execution took #{duration} seconds"\n  duration\nend',
      points: 20,
      validationCriteria: {
        requiredElements: ['def time_it', 'yield', 'Time.now']
      },
      explanation: 'yield invokes the block passed to a Ruby method, fundamental to closures in Ruby.'
    },
    {
      id: 'ruby_q4',
      skill: 'Ruby',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'In Ruby on Rails / ActiveRecord, write a query to fetch all published Articles that have at least 5 comments, including comments to prevent N+1 queries.',
      starterCode: '# ActiveRecord query:\n# Article.includes(...)\n',
      expectedAnswer: 'Article.includes(:comments).where(published: true).where("comments_count >= ?", 5)',
      points: 20,
      validationCriteria: {
        requiredElements: ['includes(:comments)', 'where']
      },
      explanation: 'ActiveRecord includes(:association) preloads related records to prevent N+1 database queries.'
    },
    {
      id: 'ruby_q5',
      skill: 'Ruby',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain Ruby metaprogramming: how does "method_missing" and "respond_to_missing?" work to dynamically handle calls to undefined methods on an object?',
      starterCode: '# Ruby Dynamic Dispatch & method_missing:\n',
      expectedAnswer: 'When a method is called on an object and not found in its inheritance hierarchy, Ruby calls method_missing(method_name, *args, &block). Developers override it to intercept dynamic calls. To ensure introspection methods like object.respond_to?(method) report true, respond_to_missing?(method_name, include_private = false) must always be implemented alongside method_missing.',
      points: 20,
      validationCriteria: {
        requiredElements: ['method_missing', 'respond_to_missing?', 'inheritance']
      },
      explanation: 'Pairing method_missing with respond_to_missing? maintains reflection integrity in Ruby.'
    }
  ],

  // ==========================================
  // 12. Kotlin
  // ==========================================
  'Kotlin': [
    {
      id: 'kotlin_q1',
      skill: 'Kotlin',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Kotlin data class "User" with properties id (Int), name (String), and nullable email (String? = null).',
      starterCode: 'data class User(\n    // Define properties\n)',
      expectedAnswer: 'data class User(\n    val id: Int,\n    val name: String,\n    val email: String? = null\n)',
      points: 20,
      validationCriteria: {
        requiredElements: ['data class User', 'val id: Int', 'val name: String', 'String? = null']
      },
      explanation: 'Kotlin data classes automatically generate equals(), hashCode(), toString(), and copy().'
    },
    {
      id: 'kotlin_q2',
      skill: 'Kotlin',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a Kotlin function "formatEmail(user: User): String" using the Elvis operator (?:) to return the user\'s email if present, or "no-email@domain.com" if null.',
      starterCode: 'fun formatEmail(user: User): String {\n    // Use elvis operator\n    \n}',
      expectedAnswer: 'fun formatEmail(user: User): String {\n    return user.email ?: "no-email@domain.com"\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['fun formatEmail', '?:', '"no-email@domain.com"']
      },
      explanation: 'The Elvis operator (?:) provides fallback values for nullable expressions in Kotlin.'
    },
    {
      id: 'kotlin_q3',
      skill: 'Kotlin',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write an extension function for String named "isValidEmail(): Boolean" that checks if the string contains "@" and "." without throwing exceptions on blank strings.',
      starterCode: 'fun String.isValidEmail(): Boolean {\n    // Extension function logic\n    \n}',
      expectedAnswer: 'fun String.isValidEmail(): Boolean {\n    return isNotBlank() && contains("@") && contains(".")\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['fun String.isValidEmail(): Boolean', 'contains("@")', 'contains(".")']
      },
      explanation: 'Extension functions extend existing classes with new capabilities without subclassing.'
    },
    {
      id: 'kotlin_q4',
      skill: 'Kotlin',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Kotlin Coroutine function "suspend fun fetchProfile(userId: String): User" that switches to Dispatchers.IO to perform simulated network loading using withContext.',
      starterCode: 'import kotlinx.coroutines.*\n\nsuspend fun fetchProfile(userId: String): User {\n    // Switch to IO dispatcher\n    \n}',
      expectedAnswer: 'suspend fun fetchProfile(userId: String): User = withContext(Dispatchers.IO) {\n    // Simulated network call\n    User(1, "Alice", "alice@example.com")\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['suspend fun fetchProfile', 'withContext(Dispatchers.IO)']
      },
      explanation: 'withContext(Dispatchers.IO) moves execution to background thread pools without blocking caller threads.'
    },
    {
      id: 'kotlin_q5',
      skill: 'Kotlin',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Define a sealed class hierarchy "NetworkState" in Kotlin with Loading, Success(val data: String), and Error(val exception: Throwable), and write a function using "when" expression to render appropriate UI state.',
      starterCode: 'sealed class NetworkState {\n    object Loading : NetworkState()\n    data class Success(val data: String) : NetworkState()\n    data class Error(val exception: Throwable) : NetworkState()\n}\n\nfun render(state: NetworkState): String = when (state) {\n    // Handle all states\n}',
      expectedAnswer: 'sealed class NetworkState {\n    object Loading : NetworkState()\n    data class Success(val data: String) : NetworkState()\n    data class Error(val exception: Throwable) : NetworkState()\n}\n\nfun render(state: NetworkState): String = when (state) {\n    is NetworkState.Loading -> "Loading..."\n    is NetworkState.Success -> "Data: ${state.data}"\n    is NetworkState.Error -> "Error: ${state.exception.message}"\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['sealed class NetworkState', 'is NetworkState.Loading', 'is NetworkState.Success', 'is NetworkState.Error']
      },
      explanation: 'Sealed classes represent restricted class hierarchies where "when" expressions are verified exhaustive at compile time.'
    }
  ],

  // ==========================================
  // 13. Swift
  // ==========================================
  'Swift': [
    {
      id: 'swift_q1',
      skill: 'Swift',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Swift function "filterEvenNumbers(_ numbers: [Int]) -> [Int]" using .filter { $0 % 2 == 0 }.',
      starterCode: 'func filterEvenNumbers(_ numbers: [Int]) -> [Int] {\n    // Filter even numbers\n    \n}',
      expectedAnswer: 'func filterEvenNumbers(_ numbers: [Int]) -> [Int] {\n    return numbers.filter { $0 % 2 == 0 }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['func filterEvenNumbers', 'numbers.filter', '$0 % 2 == 0']
      },
      explanation: 'Swift closures use shorthand argument names ($0) for concise inline collection transformations.'
    },
    {
      id: 'swift_q2',
      skill: 'Swift',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a Swift struct "Profile" conforming to Codable with properties id (UUID), username (String), and optional bio (String?).',
      starterCode: 'import Foundation\n\nstruct Profile: Codable {\n    // Define properties\n    \n}',
      expectedAnswer: 'struct Profile: Codable {\n    let id: UUID\n    let username: String\n    var bio: String?\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['struct Profile: Codable', 'let id: UUID', 'let username: String', 'bio: String?']
      },
      explanation: 'The Codable protocol enables seamless JSON encoding and decoding in Swift.'
    },
    {
      id: 'swift_q3',
      skill: 'Swift',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a Swift function "unwrapUsername(profile: Profile?) -> String" demonstrating optional binding with "guard let" to unwrap the profile or return "Anonymous".',
      starterCode: 'func unwrapUsername(profile: Profile?) -> String {\n    // Use guard let\n    \n}',
      expectedAnswer: 'func unwrapUsername(profile: Profile?) -> String {\n    guard let profile = profile else {\n        return "Anonymous"\n    }\n    return profile.username\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['guard let profile = profile else', 'return "Anonymous"', 'return profile.username']
      },
      explanation: 'guard let unbinds optionals early, leaving unwrapped variables in outer scope.'
    },
    {
      id: 'swift_q4',
      skill: 'Swift',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write an asynchronous Swift function "fetchData(from url: URL) async throws -> Data" using URLSession.shared.data(from: url) and validate that the HTTPURLResponse status code is 200.',
      starterCode: 'import Foundation\n\nfunc fetchData(from url: URL) async throws -> Data {\n    // Async/await with URLSession\n    \n}',
      expectedAnswer: 'func fetchData(from url: URL) async throws -> Data {\n    let (data, response) = try await URLSession.shared.data(from: url)\n    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {\n        throw URLError(.badServerResponse)\n    }\n    return data\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['async throws -> Data', 'try await URLSession.shared.data', 'httpResponse.statusCode == 200']
      },
      explanation: 'Modern Swift concurrency utilizes async/await for structured asynchronous network operations.'
    },
    {
      id: 'swift_q5',
      skill: 'Swift',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the difference between strong, weak, and unowned references in Swift ARC (Automatic Reference Counting), and explain how [weak self] inside closure capture lists prevents retain cycles.',
      starterCode: '// Swift ARC & Retain Cycles:\n// 1. Strong vs Weak vs Unowned:\n// 2. Retain cycle prevention with [weak self]:\n',
      expectedAnswer: 'Strong references increment the ARC retain count, keeping instances alive. Weak references don\'t increment retain count and automatically become nil when the target deallocates (always optional). Unowned references also don\'t increment retain count but assume the target never becomes nil. Closures capture self strongly by default; specifying [weak self] in capture lists breaks circular references between instances and closures.',
      points: 20,
      validationCriteria: {
        requiredElements: ['retain count', 'weak', 'unowned', '[weak self]', 'retain cycle']
      },
      explanation: '[weak self] capture lists prevent circular reference retention cycles in Swift ARC.'
    }
  ]
};
