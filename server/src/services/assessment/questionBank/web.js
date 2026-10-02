/**
 * SkillProof Assessment Question Bank - Web Development
 * 
 * Skills:
 * 1. HTML
 * 2. CSS
 * 3. React
 * 4. Angular
 * 5. Vue.js
 * 6. Node.js
 * 7. Express.js
 * 8. Next.js
 * 
 * Strictly 5 questions per skill, progressive difficulty (Easy -> Easy/Med -> Med -> Med/Hard -> Hard).
 */

export const WEB_QUESTIONS = {
  // ==========================================
  // 1. HTML
  // ==========================================
  'HTML': [
    {
      id: 'html_q1',
      skill: 'HTML',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a semantic HTML5 document structure containing <!DOCTYPE html>, <html> with lang="en", <head> (with meta charset and viewport title), and a <body> with <header>, <main>, and <footer> tags.',
      starterCode: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <!-- Metadata and title -->\n</head>\n<body>\n  <!-- Semantic body elements -->\n</body>\n</html>',
      expectedAnswer: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  <header><h1>Header</h1></header>\n  <main><p>Content</p></main>\n  <footer><p>Footer</p></footer>\n</body>\n</html>',
      points: 20,
      validationCriteria: {
        requiredElements: ['<!DOCTYPE html>', '<meta charset="UTF-8">', '<header>', '<main>', '<footer>']
      },
      explanation: 'Semantic HTML5 improves accessibility, reader mode fidelity, and SEO crawlability.'
    },
    {
      id: 'html_q2',
      skill: 'HTML',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write an accessible HTML form with action="/submit" and method="POST" containing an email input with associated <label for="...">, a required password input with minlength="8", and a submit button.',
      starterCode: '<form action="/submit" method="POST">\n  <!-- Accessible form fields -->\n</form>',
      expectedAnswer: '<form action="/submit" method="POST">\n  <label for="user-email">Email:</label>\n  <input type="email" id="user-email" name="email" required>\n  \n  <label for="user-password">Password:</label>\n  <input type="password" id="user-password" name="password" minlength="8" required>\n  \n  <button type="submit">Log In</button>\n</form>',
      points: 20,
      validationCriteria: {
        requiredElements: ['<form action="/submit"', '<label for=', 'type="email"', 'minlength="8"', '<button type="submit"']
      },
      explanation: 'Pairing explicit label for attributes with input IDs ensures screen reader compatibility.'
    },
    {
      id: 'html_q3',
      skill: 'HTML',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write an accessible HTML table displaying a quarterly budget with <caption>, <thead>, <tbody>, <tfoot>, using <th scope="col"> and <th scope="row"> appropriately.',
      starterCode: '<table>\n  <caption>Quarterly Budget Breakdown</caption>\n  <thead>\n    <!-- Headers -->\n  </thead>\n  <tbody>\n    <!-- Rows -->\n  </tbody>\n  <tfoot>\n    <!-- Summary -->\n  </tfoot>\n</table>',
      expectedAnswer: '<table>\n  <caption>Quarterly Budget Breakdown</caption>\n  <thead>\n    <tr>\n      <th scope="col">Department</th>\n      <th scope="col">Q1 Budget</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th scope="row">Engineering</th>\n      <td>$50,000</td>\n    </tr>\n  </tbody>\n  <tfoot>\n    <tr>\n      <th scope="row">Total</th>\n      <td>$50,000</td>\n    </tr>\n  </tfoot>\n</table>',
      points: 20,
      validationCriteria: {
        requiredElements: ['<caption>', '<thead>', '<tbody>', '<tfoot>', 'scope="col"', 'scope="row"']
      },
      explanation: 'The scope attribute designates whether a header cell relates to a column or row.'
    },
    {
      id: 'html_q4',
      skill: 'HTML',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write responsive image markup using the <picture> element and <source> tags serving "hero-wide.webp" for screens >= 1024px, "hero-tablet.webp" for >= 768px, and fallback <img> "hero-mobile.jpg" with alt and loading="lazy".',
      starterCode: '<picture>\n  <!-- Responsive sources and fallback -->\n</picture>',
      expectedAnswer: '<picture>\n  <source media="(min-width: 1024px)" srcset="hero-wide.webp" type="image/webp">\n  <source media="(min-width: 768px)" srcset="hero-tablet.webp" type="image/webp">\n  <img src="hero-mobile.jpg" alt="Company Hero Showcase" loading="lazy">\n</picture>',
      points: 20,
      validationCriteria: {
        requiredElements: ['<picture>', '<source media="(min-width:', 'srcset="hero-wide.webp"', 'loading="lazy"']
      },
      explanation: '<picture> enables art direction and bandwidth optimization by serving tailored images per viewport.'
    },
    {
      id: 'html_q5',
      skill: 'HTML',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write an accessible modal dialog container using the native HTML5 <dialog> element, including aria-labelledby for the title and a form with method="dialog" to handle native modal dismissal.',
      starterCode: '<dialog id="confirmModal" aria-labelledby="modalTitle">\n  <!-- Content and dismiss form -->\n</dialog>',
      expectedAnswer: '<dialog id="confirmModal" aria-labelledby="modalTitle">\n  <h2 id="modalTitle">Confirm Action</h2>\n  <p>Are you sure you want to delete this resource?</p>\n  <form method="dialog">\n    <button value="cancel">Cancel</button>\n    <button value="confirm" autofocus>Confirm</button>\n  </form>\n</dialog>',
      points: 20,
      validationCriteria: {
        requiredElements: ['<dialog', 'aria-labelledby="modalTitle"', '<form method="dialog">', 'autofocus']
      },
      explanation: 'The native <dialog> element manages focus trapping, top layer rendering, and Escape key dismissal.'
    }
  ],

  // ==========================================
  // 2. CSS
  // ==========================================
  'CSS': [
    {
      id: 'css_q1',
      skill: 'CSS',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write CSS using Flexbox to perfectly center child content both horizontally and vertically inside a container with class ".hero-container" that occupies full viewport height (100vh).',
      starterCode: '.hero-container {\n  min-height: 100vh;\n  display: flex;\n  /* Center children */\n}',
      expectedAnswer: '.hero-container {\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['display: flex', 'align-items: center', 'justify-content: center']
      },
      explanation: 'align-items: center and justify-content: center center flex items along cross and main axes.'
    },
    {
      id: 'css_q2',
      skill: 'CSS',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a responsive CSS Grid rule for ".card-grid" that automatically places cards in columns with a minimum width of 280px and maximum 1fr using repeat(auto-fit, minmax(...)) with a gap of 1.5rem.',
      starterCode: '.card-grid {\n  display: grid;\n  /* Responsive grid columns and gap */\n}',
      expectedAnswer: '.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['display: grid', 'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))', 'gap: 1.5rem']
      },
      explanation: 'auto-fit with minmax creates dynamic wrapping grid layouts without media queries.'
    },
    {
      id: 'css_q3',
      skill: 'CSS',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Define custom CSS variables in the :root selector for primary color (--color-primary: #06b6d4) and base border-radius (--radius-base: 8px), and demonstrate using them in a ".btn-primary" class with a hover transition.',
      starterCode: ':root {\n  /* Define CSS variables */\n}\n\n.btn-primary {\n  /* Use variables with transition */\n}',
      expectedAnswer: ':root {\n  --color-primary: #06b6d4;\n  --radius-base: 8px;\n}\n\n.btn-primary {\n  background-color: var(--color-primary);\n  border-radius: var(--radius-base);\n  transition: opacity 0.2s ease, transform 0.2s ease;\n}\n\n.btn-primary:hover {\n  opacity: 0.9;\n  transform: translateY(-2px);\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['--color-primary', 'var(--color-primary)', 'transition:']
      },
      explanation: 'CSS Custom Properties enable dynamic design tokens and maintainable themes.'
    },
    {
      id: 'css_q4',
      skill: 'CSS',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a CSS @keyframes animation named "pulseFade" that animates opacity from 0.4 to 1 and scale from 0.98 to 1.02 over 1.5 seconds infinitely with alternate direction, and apply it to class ".pulsing-badge".',
      starterCode: '@keyframes pulseFade {\n  /* Keyframe steps */\n}\n\n.pulsing-badge {\n  /* Apply animation */\n}',
      expectedAnswer: '@keyframes pulseFade {\n  0% {\n    opacity: 0.4;\n    transform: scale(0.98);\n  }\n  100% {\n    opacity: 1;\n    transform: scale(1.02);\n  }\n}\n\n.pulsing-badge {\n  animation: pulseFade 1.5s infinite alternate ease-in-out;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['@keyframes pulseFade', 'transform: scale', 'animation:', 'infinite alternate']
      },
      explanation: 'Keyframe animations allow smooth multi-step GPU-accelerated visual state transitions.'
    },
    {
      id: 'css_q5',
      skill: 'CSS',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain CSS Specificity calculation (Inline styles, IDs, Classes/attributes/pseudo-classes, Elements/pseudo-elements) and explain why avoiding "!important" leads to a more maintainable stylesheet architecture.',
      starterCode: '/* CSS Specificity Hierarchy & Architecture:\n * Calculation breakdown (A, B, C, D):\n * Why avoiding !important matters:\n */',
      expectedAnswer: 'Specificity hierarchy:\n1. Inline styles (1, 0, 0, 0)\n2. IDs (0, 1, 0, 0)\n3. Classes, attributes, and pseudo-classes (0, 0, 1, 0)\n4. Elements and pseudo-elements (0, 0, 0, 1)\nAvoiding !important is critical because !important breaks the natural cascade hierarchy, creating brittle specificity wars that can only be overridden by even more !important rules.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Inline', 'IDs', 'Classes', 'Elements', '!important', 'cascade']
      },
      explanation: 'Understanding the cascade and specificity vectors prevents CSS debugging anti-patterns.'
    }
  ],

  // ==========================================
  // 3. React
  // ==========================================
  'React': [
    {
      id: 'react_q1',
      skill: 'React',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a React functional component "Counter" that maintains count state initialized to 0 using useState, displaying the count and an increment button that updates state with functional setState.',
      starterCode: 'import React, { useState } from "react";\n\nexport default function Counter() {\n  // State and render\n  \n}',
      expectedAnswer: 'import React, { useState } from "react";\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(prev => prev + 1)}>Increment</button>\n    </div>\n  );\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['useState(0)', 'setCount', 'prev => prev + 1', 'onClick']
      },
      explanation: 'Functional state updates `prev => prev + 1` prevent race conditions with batched state updates.'
    },
    {
      id: 'react_q2',
      skill: 'React',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a React component "UserProfile" that takes "userId" prop and fetches user data from "/api/users/${userId}" using useEffect with proper dependency array and cleanup (aborting with AbortController).',
      starterCode: 'import React, { useState, useEffect } from "react";\n\nexport default function UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  // useEffect with AbortController\n}',
      expectedAnswer: 'import React, { useState, useEffect } from "react";\n\nexport default function UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    fetch(`/api/users/${userId}`, { signal: controller.signal })\n      .then(res => res.json())\n      .then(data => setUser(data))\n      .catch(err => {\n        if (err.name !== "AbortError") console.error(err);\n      });\n    return () => controller.abort();\n  }, [userId]);\n\n  return user ? <div>{user.name}</div> : <p>Loading...</p>;\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['useEffect', 'AbortController', 'signal: controller.signal', 'controller.abort()', '[userId]']
      },
      explanation: 'AbortController in useEffect cleanup cancels in-flight fetches if props change before resolution.'
    },
    {
      id: 'react_q3',
      skill: 'React',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a custom React hook "useLocalStorage(key, initialValue)" that synchronizes state with window.localStorage, returning [value, setValue].',
      starterCode: 'import { useState, useEffect } from "react";\n\nexport function useLocalStorage(key, initialValue) {\n  // Custom hook implementation\n}',
      expectedAnswer: 'import { useState, useEffect } from "react";\n\nexport function useLocalStorage(key, initialValue) {\n  const [storedValue, setStoredValue] = useState(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      return initialValue;\n    }\n  });\n\n  useEffect(() => {\n    window.localStorage.setItem(key, JSON.stringify(storedValue));\n  }, [key, storedValue]);\n\n  return [storedValue, setStoredValue];\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['useLocalStorage', 'localStorage.getItem', 'localStorage.setItem', 'JSON.parse', 'return [storedValue, setStoredValue]']
      },
      explanation: 'Lazy state initialization reads localStorage once on mount, and useEffect syncs state changes.'
    },
    {
      id: 'react_q4',
      skill: 'React',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Create a ThemeContext using React.createContext(), a ThemeProvider component providing "theme" and "toggleTheme", and a consumer component using useContext(ThemeContext).',
      starterCode: 'import React, { createContext, useContext, useState } from "react";\n\n// Create context and provider\n',
      expectedAnswer: 'import React, { createContext, useContext, useState } from "react";\n\nconst ThemeContext = createContext();\n\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState("dark");\n  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");\n  return (\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}\n\nexport function useTheme() {\n  return useContext(ThemeContext);\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['createContext()', 'ThemeContext.Provider', 'useContext(ThemeContext)', 'toggleTheme']
      },
      explanation: 'React Context API broadcasts global state across component trees without prop drilling.'
    },
    {
      id: 'react_q5',
      skill: 'React',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the difference between useMemo and useCallback in React, and write an example of using React.memo with useCallback to prevent unnecessary child re-renders.',
      starterCode: '// useMemo vs useCallback:\n// React.memo with useCallback example:\n',
      expectedAnswer: 'useMemo memoizes the RESULT of an expensive computation: useMemo(() => compute(a), [a]).\nuseCallback memoizes the CALLBACK FUNCTION INSTANCE itself: useCallback(() => handleClick(id), [id]).\nExample:\nconst Child = React.memo(({ onItemClick }) => {\n  return <button onClick={onItemClick}>Click</button>;\n});\n// In Parent:\nconst handleClick = useCallback(() => console.log("clicked"), []);\nreturn <Child onItemClick={handleClick} />;',
      points: 20,
      validationCriteria: {
        requiredElements: ['useMemo', 'useCallback', 'React.memo', 're-renders', 'dependency array']
      },
      explanation: 'useCallback preserves stable function references between parent renders to honor React.memo optimization.'
    }
  ],

  // ==========================================
  // 4. Angular
  // ==========================================
  'Angular': [
    {
      id: 'angular_q1',
      skill: 'Angular',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a basic Angular component using standalone component syntax (@Component) with selector "app-greeting", displaying a template with interpolating "{{ title }}" and an event binding (click)="onGreet()".',
      starterCode: 'import { Component } from "@angular/core";\n\n@Component({\n  selector: "app-greeting",\n  standalone: true,\n  // Template and class logic\n})',
      expectedAnswer: 'import { Component } from "@angular/core";\n\n@Component({\n  selector: "app-greeting",\n  standalone: true,\n  template: `\n    <h2>{{ title }}</h2>\n    <button (click)="onGreet()">Greet</button>\n  `\n})\nexport class GreetingComponent {\n  title = "Welcome to SkillProof";\n  onGreet() {\n    alert("Hello from Angular!");\n  }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['@Component', 'standalone: true', '{{ title }}', '(click)="onGreet()"', 'export class GreetingComponent']
      },
      explanation: 'Standalone components in modern Angular eliminate the requirement for NgModule declarations.'
    },
    {
      id: 'angular_q2',
      skill: 'Angular',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write an Angular Service decorated with @Injectable({ providedIn: "root" }) that uses HttpClient to fetch users from "/api/users" returning an Observable<User[]>.',
      starterCode: 'import { Injectable, inject } from "@angular/core";\nimport { HttpClient } from "@angular/common/http";\nimport { Observable } from "rxjs";\n\n// Injectable service\n',
      expectedAnswer: 'import { Injectable, inject } from "@angular/core";\nimport { HttpClient } from "@angular/common/http";\nimport { Observable } from "rxjs";\n\nexport interface User { id: number; name: string; }\n\n@Injectable({ providedIn: "root" })\nexport class UserService {\n  private http = inject(HttpClient);\n\n  getUsers(): Observable<User[]> {\n    return this.http.get<User[]>("/api/users");\n  }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['@Injectable', 'providedIn: "root"', 'HttpClient', 'Observable<User[]>']
      },
      explanation: 'providedIn: "root" registers singletons in the root injector for tree-shakeable dependency injection.'
    },
    {
      id: 'angular_q3',
      skill: 'Angular',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Demonstrate modern Angular control flow syntax (@if, @for, @empty) in a component template rendering an array of tasks "tasks = [\'Task 1\', \'Task 2\']".',
      starterCode: '@Component({\n  selector: "app-task-list",\n  standalone: true,\n  template: `\n    <!-- Use @if and @for -->\n  `\n})\nexport class TaskListComponent {\n  tasks: string[] = ["Task 1", "Task 2"];\n}',
      expectedAnswer: '@Component({\n  selector: "app-task-list",\n  standalone: true,\n  template: `\n    @if (tasks.length > 0) {\n      <ul>\n        @for (task of tasks; track task) {\n          <li>{{ task }}</li>\n        }\n      </ul>\n    } @else {\n      <p>No tasks available.</p>\n    }\n  `\n})\nexport class TaskListComponent {\n  tasks: string[] = ["Task 1", "Task 2"];\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['@if', '@for', 'track', '@else']
      },
      explanation: 'Modern Angular built-in control flow (@if, @for with track) provides type checking and fast change detection.'
    },
    {
      id: 'angular_q4',
      skill: 'Angular',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write an Angular Reactive Form in a component with FormBuilder creating a formGroup with "email" (Validators.required, Validators.email) and "password" (Validators.required, minLength 8).',
      starterCode: 'import { Component, inject } from "@angular/core";\nimport { FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";\n\n@Component({\n  standalone: true,\n  imports: [ReactiveFormsModule],\n  // Reactive form setup\n})',
      expectedAnswer: 'import { Component, inject } from "@angular/core";\nimport { FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";\n\n@Component({\n  standalone: true,\n  imports: [ReactiveFormsModule],\n  template: `<form [formGroup]="loginForm"></form>`\n})\nexport class LoginComponent {\n  private fb = inject(FormBuilder);\n  loginForm = this.fb.group({\n    email: ["", [Validators.required, Validators.email]],\n    password: ["", [Validators.required, Validators.minLength(8)]]\n  });\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['ReactiveFormsModule', 'FormBuilder', 'Validators.required', 'Validators.email', 'Validators.minLength']
      },
      explanation: 'Reactive forms offer synchronous programmatic validation and immutable model streams.'
    },
    {
      id: 'angular_q5',
      skill: 'Angular',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain Angular Signals (signal, computed, effect): how do signals differ from RxJS observables for synchronous component state management?',
      starterCode: '// Angular Signals vs RxJS Observables:\n// 1. signal() and computed() mechanics:\n// 2. Comparison with RxJS for component state:\n',
      expectedAnswer: 'Signals represent reactive values with fine-grained dependency tracking. signal(val) creates a writable state, computed(() => s() * 2) memoizes derived computations, and effect(() => console.log(s())) runs side effects.\nUnlike RxJS Observables, Signals are always synchronous, glitch-free, do not require manual subscriptions or unsubscription cleanup, and trigger surgical DOM updates without zone.js traversal.',
      points: 20,
      validationCriteria: {
        requiredElements: ['signal', 'computed', 'effect', 'synchronous', 'RxJS', 'glitch-free']
      },
      explanation: 'Signals enable fine-grained reactivity and zoneless change detection in modern Angular.'
    }
  ],

  // ==========================================
  // 5. Vue.js
  // ==========================================
  'Vue.js': [
    {
      id: 'vue_q1',
      skill: 'Vue.js',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Vue 3 Single File Component (SFC) using <script setup> and Composition API that declares a reactive "count" with ref(0) and an increment method, rendered in <template>.',
      starterCode: '<template>\n  <!-- Counter template -->\n</template>\n\n<script setup>\nimport { ref } from "vue";\n// Reactive state\n</script>',
      expectedAnswer: '<template>\n  <div>\n    <p>Count: {{ count }}</p>\n    <button @click="increment">Increment</button>\n  </div>\n</template>\n\n<script setup>\nimport { ref } from "vue";\nconst count = ref(0);\nconst increment = () => { count.value++; };\n</script>',
      points: 20,
      validationCriteria: {
        requiredElements: ['<script setup>', 'ref(0)', 'count.value++', '@click']
      },
      explanation: '<script setup> is the recommended syntactic sugar for Vue 3 Composition API.'
    },
    {
      id: 'vue_q2',
      skill: 'Vue.js',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'In Vue 3, write a computed property "fullName" using computed() that concatenates firstName and lastName refs, and a watch() that logs whenever fullName changes.',
      starterCode: '<script setup>\nimport { ref, computed, watch } from "vue";\n\nconst firstName = ref("Alice");\nconst lastName = ref("Smith");\n\n// Computed and Watcher\n</script>',
      expectedAnswer: '<script setup>\nimport { ref, computed, watch } from "vue";\n\nconst firstName = ref("Alice");\nconst lastName = ref("Smith");\n\nconst fullName = computed(() => `${firstName.value} ${lastName.value}`);\n\nwatch(fullName, (newVal) => {\n  console.log(`Name updated to: ${newVal}`);\n});\n</script>',
      points: 20,
      validationCriteria: {
        requiredElements: ['computed(() =>', 'watch(fullName', 'firstName.value', 'lastName.value']
      },
      explanation: 'computed() derives cached values and watch() executes side effects on reactive changes.'
    },
    {
      id: 'vue_q3',
      skill: 'Vue.js',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a reusable Vue 3 composable function "useFetch(url)" that returns { data, error, isLoading } with onMounted lifecycle hook performing the HTTP fetch.',
      starterCode: 'import { ref, onMounted } from "vue";\n\nexport function useFetch(url) {\n  // Composable logic\n}',
      expectedAnswer: 'import { ref, onMounted } from "vue";\n\nexport function useFetch(url) {\n  const data = ref(null);\n  const error = ref(null);\n  const isLoading = ref(true);\n\n  onMounted(async () => {\n    try {\n      const res = await fetch(url);\n      data.value = await res.json();\n    } catch (e) {\n      error.value = e;\n    } finally {\n      isLoading.value = false;\n    }\n  });\n\n  return { data, error, isLoading };\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['export function useFetch', 'ref(null)', 'onMounted', 'return { data, error, isLoading }']
      },
      explanation: 'Composables encapsulate and share stateful business logic across Vue components.'
    },
    {
      id: 'vue_q4',
      skill: 'Vue.js',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Pinia store in Vue 3 (defineStore) named "cart" with state "items" (array), getter "totalPrice", and action "addItem(product)".',
      starterCode: 'import { defineStore } from "pinia";\n\nexport const useCartStore = defineStore("cart", {\n  // State, getters, actions\n});',
      expectedAnswer: 'import { defineStore } from "pinia";\n\nexport const useCartStore = defineStore("cart", {\n  state: () => ({ items: [] }),\n  getters: {\n    totalPrice: (state) => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)\n  },\n  actions: {\n    addItem(product) {\n      this.items.push(product);\n    }\n  }\n});',
      points: 20,
      validationCriteria: {
        requiredElements: ['defineStore("cart"', 'state:', 'getters:', 'totalPrice', 'actions:', 'addItem']
      },
      explanation: 'Pinia is the modern, type-safe global state management library for Vue 3.'
    },
    {
      id: 'vue_q5',
      skill: 'Vue.js',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain how Vue 3 reactivity works under the hood using JavaScript Proxies compared to Vue 2 Object.defineProperty, detailing how array mutations and property additions are detected.',
      starterCode: '// Vue 3 Reactivity (Proxy) vs Vue 2 (Object.defineProperty):\n// 1. Mechanism differences:\n// 2. Detection of new properties & array mutations:\n',
      expectedAnswer: 'Vue 2 used Object.defineProperty to wrap individual getters and setters on existing object properties, failing to detect dynamically added properties (requiring Vue.set) or direct array index mutations (arr[0] = val).\nVue 3 uses ES6 Proxy to intercept operations at the object level (get, set, deleteProperty, has), natively capturing new property additions, property deletions, and array operations without patching prototype methods.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Proxy', 'Object.defineProperty', 'Vue.set', 'array index', 'deleteProperty']
      },
      explanation: 'ES6 Proxies intercept operations directly on objects and arrays without recursive property mutation.'
    }
  ],

  // ==========================================
  // 6. Node.js
  // ==========================================
  'Node.js': [
    {
      id: 'node_q1',
      skill: 'Node.js',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Node.js script using the built-in "fs/promises" module to read the contents of "data.txt" asynchronously and print it to console, handling any errors with try/catch.',
      starterCode: 'import { readFile } from "fs/promises";\n\nasync function readData() {\n  // Read file asynchronously\n}',
      expectedAnswer: 'import { readFile } from "fs/promises";\n\nasync function readData() {\n  try {\n    const content = await readFile("data.txt", "utf-8");\n    console.log(content);\n  } catch (err) {\n    console.error("Error reading file:", err.message);\n  }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['fs/promises', 'await readFile', 'utf-8', 'try', 'catch']
      },
      explanation: 'fs/promises provides native Promise-based asynchronous file operations in Node.js.'
    },
    {
      id: 'node_q2',
      skill: 'Node.js',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Create a basic HTTP server using Node.js built-in "http" module that listens on port 3000, inspects req.url, and responds with status 200 and JSON {"message": "Hello World"} for GET "/".',
      starterCode: 'import http from "http";\n\nconst server = http.createServer((req, res) => {\n  // Handle request\n});\n\nserver.listen(3000);',
      expectedAnswer: 'import http from "http";\n\nconst server = http.createServer((req, res) => {\n  if (req.method === "GET" && req.url === "/") {\n    res.writeHead(200, { "Content-Type": "application/json" });\n    res.end(JSON.stringify({ message: "Hello World" }));\n  } else {\n    res.writeHead(404);\n    res.end();\n  }\n});\n\nserver.listen(3000);',
      points: 20,
      validationCriteria: {
        requiredElements: ['http.createServer', 'res.writeHead', 'Content-Type', 'res.end', 'server.listen(3000)']
      },
      explanation: 'Node\'s http.createServer handles incoming sockets, HTTP headers, and stream serialization.'
    },
    {
      id: 'node_q3',
      skill: 'Node.js',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a Node.js class "OrderEmitter" extending EventEmitter from "events" that emits an "orderCreated" event with order details, and register a listener with .on("orderCreated", ...).',
      starterCode: 'import { EventEmitter } from "events";\n\nclass OrderEmitter extends EventEmitter {\n  createOrder(order) {\n    // Emit event\n  }\n}\n\n// Register listener\n',
      expectedAnswer: 'import { EventEmitter } from "events";\n\nclass OrderEmitter extends EventEmitter {\n  createOrder(order) {\n    this.emit("orderCreated", order);\n  }\n}\n\nconst emitter = new OrderEmitter();\nemitter.on("orderCreated", (order) => {\n  console.log("Processing order:", order.id);\n});\nemitter.createOrder({ id: 101, total: 49.99 });',
      points: 20,
      validationCriteria: {
        requiredElements: ['extends EventEmitter', 'this.emit("orderCreated"', 'emitter.on("orderCreated"']
      },
      explanation: 'EventEmitter drives the publish-subscribe event-driven architecture of Node.js.'
    },
    {
      id: 'node_q4',
      skill: 'Node.js',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Node.js stream pipeline using pipeline() from "stream/promises" and zlib.createGzip() to read a large file "source.log", compress it with gzip, and pipe it to "source.log.gz".',
      starterCode: 'import { createReadStream, createWriteStream } from "fs";\nimport { pipeline } from "stream/promises";\nimport { createGzip } from "zlib";\n\nasync function compressFile() {\n  // Stream pipeline\n}',
      expectedAnswer: 'import { createReadStream, createWriteStream } from "fs";\nimport { pipeline } from "stream/promises";\nimport { createGzip } from "zlib";\n\nasync function compressFile() {\n  await pipeline(\n    createReadStream("source.log"),\n    createGzip(),\n    createWriteStream("source.log.gz")\n  );\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['stream/promises', 'pipeline', 'createReadStream', 'createGzip', 'createWriteStream']
      },
      explanation: 'Streams process large data chunks sequentially without loading entire files into memory.'
    },
    {
      id: 'node_q5',
      skill: 'Node.js',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the phases of the Node.js Event Loop (Timers, Pending Callbacks, Idle/Prepare, Poll, Check, Close Callbacks) and explain where process.nextTick() and Promise microtasks execute relative to event loop phases.',
      starterCode: '// Node.js Event Loop & Microtask Execution:\n// 1. Phases of the loop:\n// 2. Microtask queue (process.nextTick & Promise callbacks):\n',
      expectedAnswer: '1. Event Loop Phases: Timers (setTimeout/setInterval) -> Pending Callbacks (I/O deferred) -> Poll (retrieve I/O events) -> Check (setImmediate) -> Close Callbacks (socket.on("close")).\n2. Microtask Queues: process.nextTick queue and Promise microtask queue run IMMEDIATELY after the current JavaScript operation completes, before moving to the next event loop phase. process.nextTick executes before Promise microtasks.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Timers', 'Poll', 'Check', 'setImmediate', 'process.nextTick', 'microtask']
      },
      explanation: 'Microtasks have priority and drain completely between transitions between event loop phases.'
    }
  ],

  // ==========================================
  // 7. Express.js
  // ==========================================
  'Express.js': [
    {
      id: 'express_q1',
      skill: 'Express.js',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write an Express.js application with express.json() body parser middleware, a GET route at "/" returning JSON {"status": "ok"}, and start listening on port 3000.',
      starterCode: 'import express from "express";\n\nconst app = express();\n\n// Middleware and routes\n',
      expectedAnswer: 'import express from "express";\n\nconst app = express();\napp.use(express.json());\n\n@app.get("/", (req, res) => {\n  res.json({ status: "ok" });\n});\n\napp.listen(3000);',
      points: 20,
      validationCriteria: {
        requiredElements: ['express()', 'app.use(express.json())', 'app.get("/",', 'res.json', 'app.listen']
      },
      explanation: 'express.json() parses application/json payloads onto req.body.'
    },
    {
      id: 'express_q2',
      skill: 'Express.js',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a custom Express logging middleware that records request method, URL, and timestamp with console.log, and calls next() to pass control to the next handler.',
      starterCode: 'function requestLogger(req, res, next) {\n  // Log and proceed\n}',
      expectedAnswer: 'function requestLogger(req, res, next) {\n  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);\n  next();\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['req.method', 'req.url', 'next()']
      },
      explanation: 'Middleware functions access req, res, and call next() to propagate the request pipeline.'
    },
    {
      id: 'express_q3',
      skill: 'Express.js',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Create an Express Router "userRouter" in a separate router module with GET "/:id" and POST "/" routes, and mount it in the main app under "/api/users".',
      starterCode: 'import { Router } from "express";\n\nconst userRouter = Router();\n// Define routes and mount\n',
      expectedAnswer: 'import express, { Router } from "express";\n\nconst userRouter = Router();\nuserRouter.get("/:id", (req, res) => res.json({ id: req.params.id }));\nuserRouter.post("/", (req, res) => res.status(201).json(req.body));\n\nconst app = express();\napp.use("/api/users", userRouter);',
      points: 20,
      validationCriteria: {
        requiredElements: ['Router()', 'userRouter.get("/:id"', 'app.use("/api/users", userRouter)']
      },
      explanation: 'Express Router modularizes route definitions and URL namespace mounting.'
    },
    {
      id: 'express_q4',
      skill: 'Express.js',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a centralized Express error-handling middleware function (err, req, res, next) that logs the error stack and responds with status code err.status || 500 and a structured JSON error object.',
      starterCode: 'function errorHandler(err, req, res, next) {\n  // Error handling middleware\n}',
      expectedAnswer: 'function errorHandler(err, req, res, next) {\n  console.error(err.stack);\n  const statusCode = err.status || 500;\n  res.status(statusCode).json({\n    error: {\n      message: err.message || "Internal Server Error",\n      status: statusCode\n    }\n  });\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['err, req, res, next', 'res.status', 'statusCode', 'res.json']
      },
      explanation: 'Express recognizes error-handling middleware by its exact 4-parameter signature (err, req, res, next).'
    },
    {
      id: 'express_q5',
      skill: 'Express.js',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write an authentication guard middleware "requireJwt" in Express that verifies a Bearer token in the "Authorization" header using jsonwebtoken.verify(), attaching decoded payload to req.user or returning 401/403.',
      starterCode: 'import jwt from "jsonwebtoken";\n\nfunction requireJwt(req, res, next) {\n  // Validate JWT bearer token\n}',
      expectedAnswer: 'import jwt from "jsonwebtoken";\n\nfunction requireJwt(req, res, next) {\n  const authHeader = req.headers["authorization"];\n  if (!authHeader || !authHeader.startsWith("Bearer ")) {\n    return res.status(401).json({ error: "Missing or invalid token" });\n  }\n  const token = authHeader.split(" ")[1];\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");\n    req.user = decoded;\n    next();\n  } catch (err) {\n    return res.status(403).json({ error: "Token verification failed" });\n  }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['authorization', 'Bearer ', 'jwt.verify', 'req.user =', 'res.status(401)', 'next()']
      },
      explanation: 'Guards routes by verifying cryptographic JWT signatures before executing downstream controllers.'
    }
  ],

  // ==========================================
  // 8. Next.js
  // ==========================================
  'Next.js': [
    {
      id: 'next_q1',
      skill: 'Next.js',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'In Next.js App Router (app/page.jsx), write a Server Component displaying a welcome header and rendering an async data list fetched directly inside the component.',
      starterCode: '// app/page.jsx\nexport default async function HomePage() {\n  // Direct server component fetch\n}',
      expectedAnswer: 'export default async function HomePage() {\n  const res = await fetch("https://api.example.com/items", { cache: "no-store" });\n  const items = await res.json();\n  return (\n    <main>\n      <h1>Welcome to Next.js App</h1>\n      <ul>\n        {items.map(item => <li key={item.id}>{item.name}</li>)}\n      </ul>\n    </main>\n  );\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['export default async function', 'await fetch', 'return (', '<main>']
      },
      explanation: 'Next.js App Router Server Components can execute async operations directly without getServerSideProps.'
    },
    {
      id: 'next_q2',
      skill: 'Next.js',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Explain when and how to use the "use client" directive in Next.js App Router: write a Client Component "InteractiveLikeButton" with useState and onClick handling.',
      starterCode: '// Define Client Component\n',
      expectedAnswer: '"use client";\nimport { useState } from "react";\n\nexport default function InteractiveLikeButton() {\n  const [liked, setLiked] = useState(false);\n  return (\n    <button onClick={() => setLiked(prev => !prev)}>\n      {liked ? "Liked!" : "Like"}\n    </button>\n  );\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['"use client"', 'useState', 'onClick']
      },
      explanation: '"use client" marks boundary components that require browser APIs, event listeners, or React state hooks.'
    },
    {
      id: 'next_q3',
      skill: 'Next.js',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'In Next.js App Router, write an API Route Handler at "app/api/products/route.js" exporting GET and POST functions using NextResponse.json().',
      starterCode: 'import { NextResponse } from "next/server";\n\nexport async function GET(request) {\n  // GET handler\n}\n\nexport async function POST(request) {\n  // POST handler\n}',
      expectedAnswer: 'import { NextResponse } from "next/server";\n\nexport async function GET(request) {\n  return NextResponse.json([{ id: 1, name: "Product A" }]);\n}\n\nexport async function POST(request) {\n  const body = await request.json();\n  return NextResponse.json({ success: true, product: body }, { status: 201 });\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['export async function GET', 'export async function POST', 'NextResponse.json', 'await request.json()']
      },
      explanation: 'Route Handlers use standard Web Request/Response APIs with NextResponse helpers.'
    },
    {
      id: 'next_q4',
      skill: 'Next.js',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Server Action in Next.js to handle form submission (e.g., "createPost(formData)") with "use server", revalidating the path cache with revalidatePath("/posts").',
      starterCode: '// app/actions.js\n"use server";\nimport { revalidatePath } from "next/cache";\n\nexport async function createPost(formData) {\n  // Server Action implementation\n}',
      expectedAnswer: '"use server";\nimport { revalidatePath } from "next/cache";\n\nexport async function createPost(formData) {\n  const title = formData.get("title");\n  // Save to database\n  revalidatePath("/posts");\n  return { success: true };\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['"use server"', 'revalidatePath("/posts")', 'formData.get']
      },
      explanation: 'Server Actions execute asynchronous code on the server triggered by form submissions or client calls.'
    },
    {
      id: 'next_q5',
      skill: 'Next.js',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a Next.js middleware file "middleware.js" that checks for an "auth-token" cookie on protected paths ("/dashboard/:path*"), redirecting unauthenticated users to "/login".',
      starterCode: 'import { NextResponse } from "next/server";\n\nexport function middleware(request) {\n  // Check cookie and redirect\n}\n\nexport const config = {\n  matcher: ["/dashboard/:path*"]\n};',
      expectedAnswer: 'import { NextResponse } from "next/server";\n\nexport function middleware(request) {\n  const token = request.cookies.get("auth-token")?.value;\n  if (!token) {\n    return NextResponse.redirect(new URL("/login", request.url));\n  }\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: ["/dashboard/:path*"]\n};',
      points: 20,
      validationCriteria: {
        requiredElements: ['export function middleware', 'request.cookies.get', 'NextResponse.redirect', 'matcher: ["/dashboard/:path*"]']
      },
      explanation: 'Middleware runs before request completion on Edge runners, enabling fast redirects and authentication checks.'
    }
  ]
};
