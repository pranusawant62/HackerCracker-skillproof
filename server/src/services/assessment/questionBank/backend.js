/**
 * SkillProof Assessment Question Bank - Backend & API
 * 
 * Skills:
 * 1. FastAPI
 * 2. Flask
 * 3. Django
 * 4. REST API
 * 5. GraphQL
 * 
 * Strictly 5 questions per skill, progressive difficulty (Easy -> Easy/Med -> Med -> Med/Hard -> Hard).
 */

export const BACKEND_QUESTIONS = {
  // ==========================================
  // 1. FastAPI
  // ==========================================
  'FastAPI': [
    {
      id: 'fastapi_q1',
      skill: 'FastAPI',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a basic FastAPI application instance with a GET endpoint at "/health" that returns a JSON object {"status": "healthy"}.',
      starterCode: 'from fastapi import FastAPI\n\napp = FastAPI()\n\n# Define /health endpoint\n',
      expectedAnswer: 'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/health")\ndef get_health():\n    return {"status": "healthy"}',
      points: 20,
      validationCriteria: {
        requiredElements: ['app = FastAPI()', '@app.get("/health")', 'return {"status": "healthy"}']
      },
      explanation: '@app.get("/health") registers a GET route returning a Python dictionary serialized to JSON.'
    },
    {
      id: 'fastapi_q2',
      skill: 'FastAPI',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Define a Pydantic model "UserCreate" with fields: username (str), email (str), and age (int >= 18 using Field(ge=18)). Then write a POST endpoint at "/users" with status_code=201 accepting this model and returning the created user.',
      starterCode: 'from fastapi import FastAPI, status\nfrom pydantic import BaseModel, Field, EmailStr\n\napp = FastAPI()\n\n# Define UserCreate and endpoint\n',
      expectedAnswer: 'from fastapi import FastAPI, status\nfrom pydantic import BaseModel, Field\n\napp = FastAPI()\n\nclass UserCreate(BaseModel):\n    username: str\n    email: str\n    age: int = Field(ge=18)\n\n@app.post("/users", status_code=status.HTTP_201_CREATED)\ndef create_user(user: UserCreate):\n    return user',
      points: 20,
      validationCriteria: {
        requiredElements: ['class UserCreate(BaseModel)', 'Field(ge=18)', '@app.post("/users"', 'status_code']
      },
      explanation: 'Pydantic models validate request bodies automatically, returning HTTP 422 on schema violation.'
    },
    {
      id: 'fastapi_q3',
      skill: 'FastAPI',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Create a reusable FastAPI dependency "verify_api_key" using Depends and Header that checks if "X-API-Key" equals "secret-key-123", raising an HTTPException with status_code 401 if missing or invalid.',
      starterCode: 'from fastapi import FastAPI, Depends, Header, HTTPException, status\n\napp = FastAPI()\n\ndef verify_api_key(x_api_key: str = Header(...)):\n    # Verify API key\n',
      expectedAnswer: 'from fastapi import FastAPI, Depends, Header, HTTPException, status\n\napp = FastAPI()\n\ndef verify_api_key(x_api_key: str = Header(...)):\n    if x_api_key != "secret-key-123":\n        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API Key")\n    return x_api_key\n\n@app.get("/protected", dependencies=[Depends(verify_api_key)])\ndef protected_route():\n    return {"message": "Access granted"}',
      points: 20,
      validationCriteria: {
        requiredElements: ['def verify_api_key', 'Header(...)', 'HTTPException', '401', 'Depends']
      },
      explanation: 'FastAPI dependency injection (Depends) encapsulates reusable authorization and request validation logic.'
    },
    {
      id: 'fastapi_q4',
      skill: 'FastAPI',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write an asynchronous GET endpoint at "/items/{item_id}" that takes a path parameter item_id (int) and query parameters "limit" (int, default 10) and "offset" (int, default 0), and raises HTTPException(status_code=404) if item_id is negative.',
      starterCode: 'from fastapi import FastAPI, HTTPException, Query\n\napp = FastAPI()\n\n# Define async endpoint\n',
      expectedAnswer: 'from fastapi import FastAPI, HTTPException, Query\n\napp = FastAPI()\n\n@app.get("/items/{item_id}")\nasync def read_item(item_id: int, limit: int = 10, offset: int = 0):\n    if item_id < 0:\n        raise HTTPException(status_code=404, detail="Item not found")\n    return {"item_id": item_id, "limit": limit, "offset": offset}',
      points: 20,
      validationCriteria: {
        requiredElements: ['@app.get("/items/{item_id}")', 'async def', 'item_id: int', 'limit: int = 10', 'HTTPException']
      },
      explanation: 'Combines typed path parameters, query parameter defaults, and HTTP exceptions.'
    },
    {
      id: 'fastapi_q5',
      skill: 'FastAPI',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a FastAPI POST endpoint "/send-notification" that uses BackgroundTasks to run an async function "send_email_notification(email: str, message: str)" in the background after immediately returning HTTP 202 Accepted.',
      starterCode: 'from fastapi import FastAPI, BackgroundTasks, status\n\napp = FastAPI()\n\ndef send_email_notification(email: str, message: str):\n    # Simulate slow email send\n    pass\n\n# Create endpoint with BackgroundTasks\n',
      expectedAnswer: 'from fastapi import FastAPI, BackgroundTasks, status\n\napp = FastAPI()\n\ndef send_email_notification(email: str, message: str):\n    pass\n\n@app.post("/send-notification", status_code=status.HTTP_202_ACCEPTED)\ndef notify(email: str, message: str, background_tasks: BackgroundTasks):\n    background_tasks.add_task(send_email_notification, email, message)\n    return {"status": "Notification scheduled"}',
      points: 20,
      validationCriteria: {
        requiredElements: ['BackgroundTasks', 'background_tasks.add_task', 'status.HTTP_202_ACCEPTED']
      },
      explanation: 'BackgroundTasks dispatches tasks to run after the response is sent, minimizing API latency.'
    }
  ],

  // ==========================================
  // 2. Flask
  // ==========================================
  'Flask': [
    {
      id: 'flask_q1',
      skill: 'Flask',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a minimal Flask application with a GET route at "/" that returns "Hello, Flask World!".',
      starterCode: 'from flask import Flask\n\napp = Flask(__name__)\n\n# Define route\n',
      expectedAnswer: 'from flask import Flask\n\napp = Flask(__name__)\n\n@app.route("/")\ndef index():\n    return "Hello, Flask World!"\n\nif __name__ == "__main__":\n    app.run()',
      points: 20,
      validationCriteria: {
        requiredElements: ['app = Flask(__name__)', '@app.route("/")', 'return "Hello, Flask World!"']
      },
      explanation: 'Flask routes are registered with the @app.route() decorator.'
    },
    {
      id: 'flask_q2',
      skill: 'Flask',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a Flask route "/api/login" that only accepts POST requests, extracts JSON data from request.get_json(), and returns a JSON response with jsonify() and status code 200.',
      starterCode: 'from flask import Flask, request, jsonify\n\napp = Flask(__name__)\n\n# Define POST route\n',
      expectedAnswer: 'from flask import Flask, request, jsonify\n\napp = Flask(__name__)\n\n@app.route("/api/login", methods=["POST"])\ndef login():\n    data = request.get_json()\n    return jsonify({"message": "Success", "username": data.get("username")}), 200',
      points: 20,
      validationCriteria: {
        requiredElements: ['methods=["POST"]', 'request.get_json()', 'jsonify', '200']
      },
      explanation: 'request.get_json() parses incoming JSON bodies and jsonify serializes Python dicts.'
    },
    {
      id: 'flask_q3',
      skill: 'Flask',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Create a Flask Blueprint named "auth_bp" with url_prefix="/auth", and register a GET endpoint "/profile" inside this blueprint.',
      starterCode: 'from flask import Blueprint, jsonify\n\n# Create auth_bp Blueprint\n',
      expectedAnswer: 'from flask import Blueprint, jsonify\n\nauth_bp = Blueprint("auth", __name__, url_prefix="/auth")\n\n@auth_bp.route("/profile", methods=["GET"])\ndef profile():\n    return jsonify({"user": "current_user"})',
      points: 20,
      validationCriteria: {
        requiredElements: ['Blueprint("auth"', 'url_prefix="/auth"', '@auth_bp.route']
      },
      explanation: 'Blueprints modularize routes, controllers, and error handlers in Flask.'
    },
    {
      id: 'flask_q4',
      skill: 'Flask',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a custom decorator "@require_auth" in Flask using functools.wraps that checks if request.headers.get("Authorization") is present, returning jsonify({"error": "Unauthorized"}), 401 if missing.',
      starterCode: 'from functools import wraps\nfrom flask import request, jsonify\n\ndef require_auth(f):\n    @wraps(f)\n    def decorated_function(*args, **kwargs):\n        # Check authorization\n    return decorated_function',
      expectedAnswer: 'from functools import wraps\nfrom flask import request, jsonify\n\ndef require_auth(f):\n    @wraps(f)\n    def decorated_function(*args, **kwargs):\n        if not request.headers.get("Authorization"):\n            return jsonify({"error": "Unauthorized"}), 401\n        return f(*args, **kwargs)\n    return decorated_function',
      points: 20,
      validationCriteria: {
        requiredElements: ['@wraps(f)', 'request.headers.get("Authorization")', 'jsonify', '401', 'return f(*args, **kwargs)']
      },
      explanation: 'Custom decorators intercept requests before reaching view functions to enforce auth guards.'
    },
    {
      id: 'flask_q5',
      skill: 'Flask',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a custom error handler in Flask using @app.errorhandler(404) and @app.errorhandler(Exception) to return uniform JSON responses instead of default HTML error pages.',
      starterCode: 'from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n# Custom JSON error handlers\n',
      expectedAnswer: 'from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.errorhandler(404)\ndef not_found_error(error):\n    return jsonify({"error": "Resource not found", "status": 404}), 404\n\n@app.errorhandler(Exception)\ndef handle_exception(e):\n    return jsonify({"error": "Internal server error", "details": str(e)}), 500',
      points: 20,
      validationCriteria: {
        requiredElements: ['@app.errorhandler(404)', '@app.errorhandler(Exception)', 'jsonify', '404', '500']
      },
      explanation: '@app.errorhandler intercepts unhandled HTTP errors and exceptions to return standardized JSON.'
    }
  ],

  // ==========================================
  // 3. Django
  // ==========================================
  'Django': [
    {
      id: 'django_q1',
      skill: 'Django',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Django model "Product" inheriting from models.Model with fields: name (CharField, max_length=200), price (DecimalField, max_digits=10, decimal_places=2), and in_stock (BooleanField, default=True).',
      starterCode: 'from django.db import models\n\nclass Product(models.Model):\n    # Define fields\n',
      expectedAnswer: 'from django.db import models\n\nclass Product(models.Model):\n    name = models.CharField(max_length=200)\n    price = models.DecimalField(max_digits=10, decimal_places=2)\n    in_stock = models.BooleanField(default=True)\n\n    def __str__(self):\n        return self.name',
      points: 20,
      validationCriteria: {
        requiredElements: ['class Product(models.Model)', 'models.CharField', 'models.DecimalField', 'models.BooleanField']
      },
      explanation: 'Django ORM models define database schema tables and column constraints declaratively.'
    },
    {
      id: 'django_q2',
      skill: 'Django',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Using Django ORM, write a query to retrieve all active Products where price is strictly less than 100.00, ordered by price descending.',
      starterCode: '# Django ORM Query:\n# products = Product.objects.\n',
      expectedAnswer: 'products = Product.objects.filter(in_stock=True, price__lt=100.00).order_by("-price")',
      points: 20,
      validationCriteria: {
        requiredElements: ['Product.objects.filter', 'price__lt', 'order_by']
      },
      explanation: 'Django field lookups use double underscores, e.g. price__lt for less than.'
    },
    {
      id: 'django_q3',
      skill: 'Django',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Using Django REST Framework (DRF), write a ModelSerializer named "ProductSerializer" for the Product model that includes all model fields.',
      starterCode: 'from rest_framework import serializers\nfrom .models import Product\n\nclass ProductSerializer(serializers.ModelSerializer):\n',
      expectedAnswer: 'from rest_framework import serializers\nfrom .models import Product\n\nclass ProductSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Product\n        fields = "__all__"',
      points: 20,
      validationCriteria: {
        requiredElements: ['class ProductSerializer(serializers.ModelSerializer)', 'class Meta', 'model = Product', 'fields']
      },
      explanation: 'ModelSerializer automatically maps Django model fields into JSON serializers/deserializers.'
    },
    {
      id: 'django_q4',
      skill: 'Django',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a Django function-based view or DRF APIView with @api_view(["GET"]) that fetches products and uses ProductSerializer(products, many=True) to return Response(serializer.data).',
      starterCode: 'from rest_framework.decorators import api_view\nfrom rest_framework.response import Response\nfrom .models import Product\nfrom .serializers import ProductSerializer\n\n@api_view(["GET"])\ndef product_list(request):\n',
      expectedAnswer: 'from rest_framework.decorators import api_view\nfrom rest_framework.response import Response\nfrom .models import Product\nfrom .serializers import ProductSerializer\n\n@api_view(["GET"])\ndef product_list(request):\n    products = Product.objects.all()\n    serializer = ProductSerializer(products, many=True)\n    return Response(serializer.data)',
      points: 20,
      validationCriteria: {
        requiredElements: ['@api_view(["GET"])', 'ProductSerializer(products, many=True)', 'Response(serializer.data)']
      },
      explanation: 'many=True serializes multiple model instances into a JSON array response.'
    },
    {
      id: 'django_q5',
      skill: 'Django',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a custom Django middleware class "RequestTimingMiddleware" that records the start time in process_request / __call__, calculates duration, and adds an "X-Process-Time-Ms" header to the response.',
      starterCode: 'import time\n\nclass RequestTimingMiddleware:\n    def __init__(self, get_response):\n        self.get_response = get_response\n\n    def __call__(self, request):\n        # Compute timing and set response header\n',
      expectedAnswer: 'import time\n\nclass RequestTimingMiddleware:\n    def __init__(self, get_response):\n        self.get_response = get_response\n\n    def __call__(self, request):\n        start_time = time.time()\n        response = self.get_response(request)\n        duration = (time.time() - start_time) * 1000\n        response["X-Process-Time-Ms"] = f"{duration:.2f}"\n        return response',
      points: 20,
      validationCriteria: {
        requiredElements: ['time.time()', 'self.get_response(request)', 'X-Process-Time-Ms']
      },
      explanation: 'Django middleware processes every incoming request and outgoing response uniformly.'
    }
  ],

  // ==========================================
  // 4. REST API
  // ==========================================
  'REST API': [
    {
      id: 'rest_q1',
      skill: 'REST API',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Explain the RESTful conventions for HTTP verbs (GET, POST, PUT, PATCH, DELETE) and provide the standard status code returned when a new resource is successfully created.',
      starterCode: '# RESTful HTTP Verbs:\n# GET:\n# POST:\n# PUT:\n# PATCH:\n# DELETE:\n# Status code for resource creation:\n',
      expectedAnswer: 'GET: Retrieve a resource.\nPOST: Create a new resource.\nPUT: Replace an entire resource.\nPATCH: Partially update a resource.\nDELETE: Remove a resource.\nCreated status code: 201 Created.',
      points: 20,
      validationCriteria: {
        requiredElements: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', '201']
      },
      explanation: 'Standard REST methods map cleanly to CRUD operations with deterministic HTTP semantics.'
    },
    {
      id: 'rest_q2',
      skill: 'REST API',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Design a clean RESTful URL scheme for an e-commerce API supporting: 1) list all orders for a customer, 2) get a specific order, and 3) cancel an order.',
      starterCode: '# RESTful URLs:\n# 1. List customer orders:\n# 2. Get specific order:\n# 3. Cancel order:\n',
      expectedAnswer: '1. GET /customers/{customerId}/orders\n2. GET /orders/{orderId}\n3. PATCH /orders/{orderId} with {"status": "cancelled"} or POST /orders/{orderId}/cancel',
      points: 20,
      validationCriteria: {
        requiredElements: ['/customers', '/orders', '{orderId}']
      },
      explanation: 'Clean REST resource hierarchy uses plural nouns and nested identifiers for sub-resources.'
    },
    {
      id: 'rest_q3',
      skill: 'REST API',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain idempotency in REST APIs: which HTTP methods are idempotent, which are not, and why is idempotency critical for network retries?',
      starterCode: '# Idempotent methods:\n# Non-idempotent methods:\n# Importance for network retries:\n',
      expectedAnswer: 'Idempotent methods: GET, PUT, DELETE, HEAD, OPTIONS. Executing them multiple times produces the identical side effect on the server.\nNon-idempotent: POST (multiple calls create multiple duplicate resources).\nImportance: When network timeouts occur, idempotent requests can be safely retried without duplicating data or creating conflicting states.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Idempotent', 'GET', 'PUT', 'DELETE', 'POST', 'retries']
      },
      explanation: 'Idempotent operations guarantee that repeated requests yield the same state as a single execution.'
    },
    {
      id: 'rest_q4',
      skill: 'REST API',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a JSON schema representing a standard RFC 7807 (Problem Details for HTTP APIs) error payload for an HTTP 400 Bad Request with field validation errors.',
      starterCode: '{\n  "type": "https://api.example.com/errors/validation-error",\n  "title": "Bad Request",\n  "status": 400,\n  "detail": "One or more validation errors occurred.",\n  "instance": "/orders/123",\n  "errors": [\n    \n  ]\n}',
      expectedAnswer: '{\n  "type": "https://api.example.com/errors/validation-error",\n  "title": "Bad Request",\n  "status": 400,\n  "detail": "One or more validation errors occurred.",\n  "instance": "/orders/123",\n  "invalidParams": [\n    {"name": "email", "reason": "Invalid email format"},\n    {"name": "quantity", "reason": "Must be greater than 0"}\n  ]\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['type', 'title', 'status', '400', 'detail']
      },
      explanation: 'RFC 7807 defines a standardized format for expressing error details in HTTP APIs.'
    },
    {
      id: 'rest_q5',
      skill: 'REST API',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain how cursor-based pagination works in REST APIs compared to offset-limit pagination, explaining why cursor pagination avoids duplicate/missing items when items are inserted during pagination.',
      starterCode: '# Cursor-based vs Offset Pagination:\n# Offset: ?limit=10&offset=20\n# Cursor: ?limit=10&cursor=eyJpZCI6MTAxfQ==\n# Comparison:\n',
      expectedAnswer: 'Offset pagination queries using OFFSET N, which performs O(N) database skips and skips/duplicates items if rows are inserted or deleted while a client is paginating. Cursor pagination uses a deterministic indexed pointer (e.g. WHERE id > last_seen_id ORDER BY id ASC LIMIT 10), ensuring constant O(1) index seek performance and immutability against newly inserted records.',
      points: 20,
      validationCriteria: {
        requiredElements: ['cursor', 'offset', 'pointer', 'duplicate', 'index']
      },
      explanation: 'Cursor-based pagination provides stable pagination unaffected by realtime database mutations.'
    }
  ],

  // ==========================================
  // 5. GraphQL
  // ==========================================
  'GraphQL': [
    {
      id: 'graphql_q1',
      skill: 'GraphQL',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a basic GraphQL Schema Definition Language (SDL) defining a "User" type with fields: id (ID!), username (String!), email (String!), and age (Int).',
      starterCode: 'type User {\n  # Define fields\n}',
      expectedAnswer: 'type User {\n  id: ID!\n  username: String!\n  email: String!\n  age: Int\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['type User', 'id: ID!', 'username: String!', 'email: String!']
      },
      explanation: 'GraphQL SDL specifies data types where "!" denotes non-nullable fields.'
    },
    {
      id: 'graphql_q2',
      skill: 'GraphQL',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a GraphQL client query requesting the "user(id: \\"101\\")" field, fetching only their username and email, along with the title and id of their posts.',
      starterCode: 'query GetUserData {\n  user(id: "101") {\n    \n  }\n}',
      expectedAnswer: 'query GetUserData {\n  user(id: "101") {\n    username\n    email\n    posts {\n      id\n      title\n    }\n  }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['query', 'user(id:', 'username', 'email', 'posts']
      },
      explanation: 'GraphQL queries allow clients to request precisely the nested fields they require, preventing over-fetching.'
    },
    {
      id: 'graphql_q3',
      skill: 'GraphQL',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a JavaScript Apollo Server resolver for a Query "user" that takes arguments (parent, args, context) and retrieves the user with args.id from context.db.',
      starterCode: 'const resolvers = {\n  Query: {\n    user: async (parent, args, context) => {\n      // Retrieve user from context.db\n    }\n  }\n};',
      expectedAnswer: 'const resolvers = {\n  Query: {\n    user: async (parent, args, context) => {\n      return await context.db.users.findById(args.id);\n    }\n  }\n};',
      points: 20,
      validationCriteria: {
        requiredElements: ['Query:', 'user:', 'context.db', 'args.id']
      },
      explanation: 'GraphQL resolvers map schema fields to database or business logic calls.'
    },
    {
      id: 'graphql_q4',
      skill: 'GraphQL',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a GraphQL Mutation schema definition and client query for "createUser(input: CreateUserInput!): User!" taking an input type containing username and email.',
      starterCode: 'input CreateUserInput {\n  username: String!\n  email: String!\n}\n\ntype Mutation {\n  createUser(input: CreateUserInput!): User!\n}\n\n# Client mutation query:\n',
      expectedAnswer: 'input CreateUserInput {\n  username: String!\n  email: String!\n}\n\ntype Mutation {\n  createUser(input: CreateUserInput!): User!\n}\n\nmutation CreateNewUser($input: CreateUserInput!) {\n  createUser(input: $input) {\n    id\n    username\n    email\n  }\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['input CreateUserInput', 'type Mutation', 'createUser', 'mutation']
      },
      explanation: 'Mutations mutate server state and return the updated fields requested by the client.'
    },
    {
      id: 'graphql_q5',
      skill: 'GraphQL',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the N+1 query problem in GraphQL when resolving nested relations (e.g. fetching author for each post) and describe how DataLoader solves it using batching and caching.',
      starterCode: '# GraphQL N+1 Problem and DataLoader Solution:\n# Problem explanation:\n# DataLoader mechanism (batching & caching):\n',
      expectedAnswer: 'Problem: If a query fetches 50 posts and each post resolves its "author", GraphQL executes 1 query for posts and 50 separate queries for each author (N+1 database hits).\nDataLoader Solution: DataLoader coalesces individual load requests occurring within a single event-loop tick into a single batch query (e.g., SELECT * FROM authors WHERE id IN (...)), and caches results by key during request lifetime.',
      points: 20,
      validationCriteria: {
        requiredElements: ['N+1', 'batch', 'DataLoader', 'caching', 'event loop']
      },
      explanation: 'DataLoader batches and memoizes requests to eliminate the N+1 problem in GraphQL resolvers.'
    }
  ]
};
