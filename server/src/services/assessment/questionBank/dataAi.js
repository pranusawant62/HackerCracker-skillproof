/**
 * SkillProof Assessment Question Bank - Data & AI
 * 
 * Skills:
 * 1. Pandas
 * 2. NumPy
 * 3. Data Analysis
 * 4. Machine Learning
 * 5. Artificial Intelligence
 * 
 * Strictly 5 questions per skill, progressive difficulty (Easy -> Easy/Med -> Med -> Med/Hard -> Hard).
 */

export const DATA_AI_QUESTIONS = {
  // ==========================================
  // 1. Pandas
  // ==========================================
  'Pandas': [
    {
      id: 'pandas_q1',
      skill: 'Pandas',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Pandas statement to read a CSV file "sales.csv" into a DataFrame, and filter for rows where the "revenue" column is greater than 10000.',
      starterCode: 'import pandas as pd\n\n# Read CSV and filter\n',
      expectedAnswer: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\nhigh_sales = df[df["revenue"] > 10000]',
      points: 20,
      validationCriteria: {
        requiredElements: ['pd.read_csv', 'df["revenue"] > 10000']
      },
      explanation: 'Boolean indexing `df[df["col"] > val]` filters DataFrame rows conditionally.'
    },
    {
      id: 'pandas_q2',
      skill: 'Pandas',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a Pandas statement to group a DataFrame "df" by "department" and compute the mean and max of the "salary" column using .groupby() and .agg().',
      starterCode: 'import pandas as pd\n\n# Group and aggregate\n',
      expectedAnswer: 'dept_stats = df.groupby("department")["salary"].agg(["mean", "max"])',
      points: 20,
      validationCriteria: {
        requiredElements: ['df.groupby("department")', 'agg', 'mean', 'max']
      },
      explanation: '.agg(["mean", "max"]) executes multiple aggregation metrics across grouped categories.'
    },
    {
      id: 'pandas_q3',
      skill: 'Pandas',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Demonstrate handling missing data in Pandas: fill missing values in numeric column "age" with its median, and drop any rows where "email" is null.',
      starterCode: 'import pandas as pd\n\n# Fill age nulls with median, drop missing email\n',
      expectedAnswer: 'df["age"] = df["age"].fillna(df["age"].median())\ndf = df.dropna(subset=["email"])',
      points: 20,
      validationCriteria: {
        requiredElements: ['fillna', 'median()', 'dropna(subset=["email"])']
      },
      explanation: 'fillna imputes central tendency measures, while dropna(subset=[...]) purges rows lacking mandatory identifiers.'
    },
    {
      id: 'pandas_q4',
      skill: 'Pandas',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Perform an inner merge between DataFrames "orders" and "customers" on key "customer_id", followed by creating a pivot table showing total "amount" with "country" as index and "status" as columns.',
      starterCode: 'import pandas as pd\n\n# Merge and pivot\n',
      expectedAnswer: 'merged = pd.merge(orders, customers, on="customer_id", how="inner")\npivot = merged.pivot_table(index="country", columns="status", values="amount", aggfunc="sum", fill_value=0)',
      points: 20,
      validationCriteria: {
        requiredElements: ['pd.merge', 'on="customer_id"', 'pivot_table', 'index="country"', 'aggfunc="sum"']
      },
      explanation: 'pd.merge joins relational tables, and pivot_table reorganizes dimensions for cross-tabulated analysis.'
    },
    {
      id: 'pandas_q5',
      skill: 'Pandas',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Convert column "timestamp" to datetime, set it as index, and compute a 7-day rolling average of the "active_users" column, resampled by day (\'D\').',
      starterCode: 'import pandas as pd\n\n# Datetime conversion, resample, and 7-day rolling mean\n',
      expectedAnswer: 'df["timestamp"] = pd.to_datetime(df["timestamp"])\ndf = df.set_index("timestamp")\nrolling_avg = df["active_users"].resample("D").mean().rolling(window=7).mean()',
      points: 20,
      validationCriteria: {
        requiredElements: ['pd.to_datetime', 'set_index', 'rolling(window=7).mean()']
      },
      explanation: 'Time-series operations with resample() and rolling() smooth volatility and calculate moving window metrics.'
    }
  ],

  // ==========================================
  // 2. NumPy
  // ==========================================
  'NumPy': [
    {
      id: 'numpy_q1',
      skill: 'NumPy',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a NumPy statement to create a 1D array of integers from 10 to 49 (inclusive) using np.arange(), and print its shape and data type.',
      starterCode: 'import numpy as np\n\n# Create array and print properties\n',
      expectedAnswer: 'import numpy as np\n\narr = np.arange(10, 50)\nprint(arr.shape, arr.dtype)',
      points: 20,
      validationCriteria: {
        requiredElements: ['np.arange(10, 50)', 'arr.shape', 'arr.dtype']
      },
      explanation: 'np.arange generates half-open numerical ranges as contiguous C-memory buffer arrays.'
    },
    {
      id: 'numpy_q2',
      skill: 'NumPy',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Reshape a 1D array of 12 elements into a 3x4 2D matrix, and compute the sum of each column using np.sum(axis=0).',
      starterCode: 'import numpy as np\n\narr = np.arange(12)\n# Reshape and sum along axis 0\n',
      expectedAnswer: 'matrix = arr.reshape((3, 4))\ncol_sums = np.sum(matrix, axis=0)',
      points: 20,
      validationCriteria: {
        requiredElements: ['reshape((3, 4))', 'np.sum', 'axis=0']
      },
      explanation: 'reshape reorganizes strides without copying memory; axis=0 collapses rows into column totals.'
    },
    {
      id: 'numpy_q3',
      skill: 'NumPy',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Demonstrate NumPy broadcasting: given a 2D array "A" of shape (4, 3) and a 1D array "B" of shape (3,), explain how A + B broadcasts, and write the code to normalize columns of A by subtracting column means.',
      starterCode: 'import numpy as np\n\nA = np.random.rand(4, 3)\n# Column mean normalization via broadcasting\n',
      expectedAnswer: 'col_means = np.mean(A, axis=0)\nnormalized_A = A - col_means',
      points: 20,
      validationCriteria: {
        requiredElements: ['np.mean(A, axis=0)', 'A - col_means']
      },
      explanation: 'Broadcasting duplicates array dimensions along trailing axis dimensions without memory duplication.'
    },
    {
      id: 'numpy_q4',
      skill: 'NumPy',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a NumPy function to compute the Euclidean distance matrix between two sets of vectors using vectorized broadcasting (without Python loops).',
      starterCode: 'import numpy as np\n\ndef euclidean_distances(X, Y):\n    # Vectorized computation of ||X_i - Y_j||\n    \n}',
      expectedAnswer: 'def euclidean_distances(X, Y):\n    # X: (N, D), Y: (M, D)\n    return np.sqrt(np.sum((X[:, np.newaxis, :] - Y[np.newaxis, :, :]) ** 2, axis=-1))',
      points: 20,
      validationCriteria: {
        requiredElements: ['np.newaxis', 'np.sqrt', 'np.sum']
      },
      explanation: 'Adding singleton dimensions with np.newaxis allows pairwise vector subtractions in pure C speed.'
    },
    {
      id: 'numpy_q5',
      skill: 'NumPy',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Compute the matrix dot product and matrix inverse of an invertible 3x3 matrix "M" using np.linalg, checking that M @ M_inv is approximately equal to the identity matrix with np.allclose().',
      starterCode: 'import numpy as np\n\nM = np.array([[1, 2, 3], [0, 1, 4], [5, 6, 0]])\n# Compute inverse and verify identity\n',
      expectedAnswer: 'M_inv = np.linalg.inv(M)\nidentity = M @ M_inv\nis_valid = np.allclose(identity, np.eye(3))',
      points: 20,
      validationCriteria: {
        requiredElements: ['np.linalg.inv(M)', 'M @ M_inv', 'np.allclose', 'np.eye(3)']
      },
      explanation: 'np.linalg.inv calculates matrix inverse and np.allclose safely checks floating point equality within epsilon tolerances.'
    }
  ],

  // ==========================================
  // 3. Data Analysis
  // ==========================================
  'Data Analysis': [
    {
      id: 'data_analysis_q1',
      skill: 'Data Analysis',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Explain the difference between Mean, Median, and Mode, and describe why Median is preferred over Mean when analyzing skewed distributions with extreme outliers (e.g. household income).',
      starterCode: '# Mean, Median, Mode & Outlier Sensitivity:\n# Definitions:\n# Why Median resists outliers:\n',
      expectedAnswer: 'Mean: Arithmetic average of all values.\nMedian: Middle value in a sorted dataset (50th percentile).\nMode: Most frequently occurring value.\nMedian is preferred for skewed distributions because extreme outliers heavily pull the Mean in the direction of the tail, whereas the Median reflects central tendency unaffected by extreme magnitudes.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Mean', 'Median', 'Mode', 'outliers', 'skewed']
      },
      explanation: 'Median is a non-parametric robust statistic resistant to heavy tails and outliers.'
    },
    {
      id: 'data_analysis_q2',
      skill: 'Data Analysis',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Explain how to detect and handle outliers in a continuous numerical feature using the Interquartile Range (IQR) method: define Q1, Q3, IQR, and the lower/upper outlier bounds.',
      starterCode: '# IQR Outlier Detection:\n# 1. Quartiles & IQR:\n# 2. Lower & Upper Bounds:\n',
      expectedAnswer: '1. Q1 = 25th percentile, Q3 = 75th percentile, IQR = Q3 - Q1.\n2. Lower Bound = Q1 - 1.5 * IQR\n   Upper Bound = Q3 + 1.5 * IQR\nAny observations falling below the Lower Bound or above the Upper Bound are classified as potential statistical outliers.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Q1', 'Q3', 'IQR', '1.5', 'Lower Bound', 'Upper Bound']
      },
      explanation: 'The 1.5 * IQR rule is the standard statistical fence for outlier identification in boxplots.'
    },
    {
      id: 'data_analysis_q3',
      skill: 'Data Analysis',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain Pearson correlation coefficient (r): what range of values can it take, what indicates strong positive, strong negative, and no linear correlation, and why does correlation not imply causation?',
      starterCode: '# Pearson Correlation Coefficient (r):\n# Value range:\n# Interpretation of +1, -1, 0:\n# Correlation vs Causation:\n',
      expectedAnswer: 'Range: -1.0 to +1.0.\nInterpretation: +1.0 indicates perfect positive linear relationship, -1.0 indicates perfect negative linear relationship, 0 indicates no linear correlation.\nCorrelation vs Causation: Two variables may correlate due to coincidental trends, reverse causality, or confounding third variables (spurious correlation) without one causing the other.',
      points: 20,
      validationCriteria: {
        requiredElements: ['-1', '+1', 'linear', 'confounding', 'causation']
      },
      explanation: 'Correlation measures linear association, but causal inference requires controlled experimentation.'
    },
    {
      id: 'data_analysis_q4',
      skill: 'Data Analysis',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Describe the complete Exploratory Data Analysis (EDA) workflow applied when receiving a new raw tabular dataset before building machine learning models.',
      starterCode: '# Exploratory Data Analysis (EDA) Steps:\n# 1. Structure inspection:\n# 2. Data cleaning:\n# 3. Univariate & Bivariate analysis:\n',
      expectedAnswer: '1. Structure: Check df.info(), df.shape, column types, and df.describe() for summary statistics.\n2. Cleaning: Detect missing values (df.isnull().sum()), duplicates, and inconsistent encodings/categories.\n3. Univariate Analysis: Plot histograms/KDE for distributions and boxplots for outliers.\n4. Bivariate/Multivariate: Correlation heatmaps, scatter plots against target variables, and feature cross-tabulations.',
      points: 20,
      validationCriteria: {
        requiredElements: ['info()', 'describe()', 'missing values', 'distributions', 'correlation']
      },
      explanation: 'EDA reveals data quality issues, structural anomalies, and predictive feature interactions.'
    },
    {
      id: 'data_analysis_q5',
      skill: 'Data Analysis',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain A/B Testing statistical methodology: describe the Null Hypothesis (H0), Type I error (alpha), Type II error (beta), p-value interpretation, and when to conclude statistical significance.',
      starterCode: '# A/B Testing Statistical Foundations:\n# H0 vs H1:\n# Alpha & Beta errors:\n# P-value and decision rule:\n',
      expectedAnswer: 'H0 (Null Hypothesis): No true difference between variant A and variant B.\nType I error (alpha): False positive (typically alpha = 0.05).\nType II error (beta): False negative (1 - beta = statistical power, typically 80%).\nP-value: Probability of observing the data given H0 is true.\nDecision: If p-value < alpha (e.g. p < 0.05), reject H0 and conclude the variant produced a statistically significant lift.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Null Hypothesis', 'Type I', 'Type II', 'p-value', 'alpha', 'reject H0']
      },
      explanation: 'Hypothesis testing provides mathematical guarantees against adopting random noise as real product impact.'
    }
  ],

  // ==========================================
  // 4. Machine Learning
  // ==========================================
  'Machine Learning': [
    {
      id: 'ml_q1',
      skill: 'Machine Learning',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write Python code using scikit-learn to split features X and target y into training and test sets (80/20 split) using train_test_split with a fixed random_state.',
      starterCode: 'from sklearn.model_selection import train_test_split\n\n# Split X and y\n',
      expectedAnswer: 'from sklearn.model_selection import train_test_split\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)',
      points: 20,
      validationCriteria: {
        requiredElements: ['train_test_split', 'test_size=0.2', 'random_state=42']
      },
      explanation: 'train_test_split partitions datasets to validate generalization on unseen data.'
    },
    {
      id: 'ml_q2',
      skill: 'Machine Learning',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write code using scikit-learn StandardScaler to fit and transform training features X_train, and transform test features X_test without refitting to prevent data leakage.',
      starterCode: 'from sklearn.preprocessing import StandardScaler\n\nscaler = StandardScaler()\n# Fit and transform\n',
      expectedAnswer: 'from sklearn.preprocessing import StandardScaler\n\nscaler = StandardScaler()\nX_train_scaled = scaler.fit_transform(X_train)\nX_test_scaled = scaler.transform(X_test)',
      points: 20,
      validationCriteria: {
        requiredElements: ['scaler.fit_transform(X_train)', 'scaler.transform(X_test)']
      },
      explanation: 'Crucial: Never call fit() on test data; only transform() to preserve true evaluation isolation.'
    },
    {
      id: 'ml_q3',
      skill: 'Machine Learning',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain the Bias-Variance tradeoff: what characterizes high bias (underfitting) vs high variance (overfitting), and what techniques mitigate each?',
      starterCode: '# Bias-Variance Tradeoff:\n# High Bias (Underfitting):\n# High Variance (Overfitting):\n# Mitigation techniques:\n',
      expectedAnswer: 'High Bias (Underfitting): Model is overly simplistic and fails to capture underlying patterns, showing high training and testing error. Mitigate by increasing model complexity, adding polynomial features, or reducing regularization.\nHigh Variance (Overfitting): Model memorizes training noise and fails to generalize, showing low training error but high test error. Mitigate by adding L1/L2 regularization, dropout, pruning trees, or gathering more training data.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Bias', 'Variance', 'underfitting', 'overfitting', 'regularization']
      },
      explanation: 'Balancing bias and variance optimizes total expected generalization error on unseen data.'
    },
    {
      id: 'ml_q4',
      skill: 'Machine Learning',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write code using scikit-learn to train a RandomForestClassifier, make predictions on X_test, and print the classification_report and ROC AUC score.',
      starterCode: 'from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report, roc_auc_score\n\n# Train, predict, and evaluate\n',
      expectedAnswer: 'from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report, roc_auc_score\n\nclf = RandomForestClassifier(n_estimators=100, random_state=42)\nclf.fit(X_train, y_train)\ny_pred = clf.predict(X_test)\ny_proba = clf.predict_proba(X_test)[:, 1]\nprint(classification_report(y_test, y_pred))\nprint("ROC AUC:", roc_auc_score(y_test, y_proba))',
      points: 20,
      validationCriteria: {
        requiredElements: ['RandomForestClassifier', 'clf.fit', 'clf.predict', 'classification_report', 'roc_auc_score']
      },
      explanation: 'Precision, recall, F1, and ROC AUC provide comprehensive evaluation beyond basic accuracy.'
    },
    {
      id: 'ml_q5',
      skill: 'Machine Learning',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain K-Fold Cross-Validation and Stratified K-Fold: why is Stratified K-Fold critical for imbalanced classification tasks (e.g. 98% class 0, 2% class 1)?',
      starterCode: '# Cross-Validation in Imbalanced Datasets:\n# K-Fold vs Stratified K-Fold:\n# Importance for imbalanced classes:\n',
      expectedAnswer: 'Standard K-Fold splits data into K equal folds randomly, which can result in folds containing zero minority class examples in severely imbalanced datasets.\nStratified K-Fold ensures that each fold maintains the EXACT class proportion (e.g. 98% class 0 and 2% class 1) as the complete dataset. This prevents training folds from lacking positive examples and guarantees uniform evaluation.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Stratified K-Fold', 'imbalanced', 'proportion', 'minority class', 'folds']
      },
      explanation: 'Stratified sampling guarantees representative class distributions across all cross-validation partitions.'
    }
  ],

  // ==========================================
  // 5. Artificial Intelligence
  // ==========================================
  'Artificial Intelligence': [
    {
      id: 'ai_q1',
      skill: 'Artificial Intelligence',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Explain the fundamental differences between Artificial Intelligence (AI), Machine Learning (ML), and Deep Learning (DL) as nested disciplines.',
      starterCode: '# AI vs ML vs DL Hierarchy:\n# 1. Artificial Intelligence (Broadest):\n# 2. Machine Learning (Subset of AI):\n# 3. Deep Learning (Subset of ML):\n',
      expectedAnswer: '1. AI: The overarching field aiming to create machines that simulate human cognitive functions (decision making, reasoning, rule-based systems).\n2. ML: A subfield of AI where algorithms learn patterns from empirical data rather than following explicitly programmed rules.\n3. DL: A subfield of ML utilizing multi-layered artificial neural networks (ANNs) to automatically learn hierarchical feature representations from raw data.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'neural networks', 'data']
      },
      explanation: 'DL is a subset of ML, which is in turn a specialized branch of computer science called AI.'
    },
    {
      id: 'ai_q2',
      skill: 'Artificial Intelligence',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Explain the architecture and purpose of an Artificial Neural Network (ANN) Perceptron: define weights (W), bias (b), weighted sum (z = W*X + b), and activation function (e.g. ReLU or Sigmoid).',
      starterCode: '# Artificial Neuron / Perceptron Components:\n# 1. Weighted Sum:\n# 2. Activation Function:\n',
      expectedAnswer: '1. Weighted Sum: Each input xi is multiplied by weight wi and summed with bias b: z = sum(wi * xi) + b.\n2. Activation Function: Applies non-linear transformation f(z) (e.g. ReLU: max(0, z), Sigmoid: 1 / (1 + e^-z)), enabling neural networks to learn non-linear boundaries rather than simple linear hyperplanes.',
      points: 20,
      validationCriteria: {
        requiredElements: ['weights', 'bias', 'activation function', 'ReLU', 'non-linear']
      },
      explanation: 'Activation functions introduce non-linearity, enabling deep networks to approximate arbitrary functions.'
    },
    {
      id: 'ai_q3',
      skill: 'Artificial Intelligence',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain the Transformer architecture\'s Self-Attention mechanism (Query, Key, Value vectors): how does Attention(Q, K, V) = softmax(Q*K^T / sqrt(d_k)) * V allow models to capture contextual token dependencies?',
      starterCode: '# Transformer Self-Attention Mechanism:\n# Roles of Q, K, V:\n# Mathematical intuition of Attention(Q, K, V):\n',
      expectedAnswer: 'Q (Query): Represents what a token is looking for.\nK (Key): Represents what a token offers.\nV (Value): Holds the actual contextual information.\nMechanism: Computing Q * K^T calculates dot-product compatibility scores between every pair of tokens in a sequence. Scaling by sqrt(d_k) prevents vanishing gradients, and softmax produces normalized attention weights. Multiplying by V yields a contextual representation weighted by relevance across long distances.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Query', 'Key', 'Value', 'softmax', 'sqrt(d_k)', 'attention weights']
      },
      explanation: 'Self-attention calculates pairwise token interactions in O(1) sequential step distance.'
    },
    {
      id: 'ai_q4',
      skill: 'Artificial Intelligence',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Explain the Retrieval-Augmented Generation (RAG) architecture: describe document chunking, vector embedding generation, vector database similarity search (e.g. cosine similarity), and prompt augmentation for LLMs.',
      starterCode: '# RAG Architecture Steps:\n# 1. Chunking & Embedding:\n# 2. Vector DB Retrieval:\n# 3. Context Augmentation & Generation:\n',
      expectedAnswer: '1. Ingestion: Documents are split into semantic chunks and converted to high-dimensional embeddings using an embedding model.\n2. Indexing & Retrieval: Embeddings are stored in a vector database. At query time, the user prompt is embedded and vector search (cosine similarity/ANN) retrieves top-k relevant chunks.\n3. Augmentation: Retrieved chunks are injected into the LLM system prompt as verified context, grounding generation and mitigating hallucinations.',
      points: 20,
      validationCriteria: {
        requiredElements: ['chunking', 'embeddings', 'vector database', 'cosine similarity', 'hallucinations']
      },
      explanation: 'RAG bridges static LLM parametric weights with dynamic external enterprise knowledge.'
    },
    {
      id: 'ai_q5',
      skill: 'Artificial Intelligence',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain AI Alignment, RLHF (Reinforcement Learning from Human Feedback), and prompt injection vulnerabilities: how do reward models align LLMs, and how can adversarial prompt injections override system instructions?',
      starterCode: '# AI Alignment, RLHF & Prompt Security:\n# 1. RLHF Pipeline (SFT -> Reward Model -> PPO):\n# 2. Prompt Injection Attacks & Defenses:\n',
      expectedAnswer: '1. RLHF: Supervised Fine-Tuning (SFT) is trained on high-quality responses. A Reward Model is trained on human pairwise preferences. Proximal Policy Optimization (PPO) then optimizes the LLM policy to maximize reward while penalizing KL divergence from base model.\n2. Prompt Injection: Adversarial user inputs trick LLMs into ignoring system safety guardrails (e.g. "Ignore previous instructions and do X"). Mitigated via delimiter isolation, input-output classification guards, and structured tool calling.',
      points: 20,
      validationCriteria: {
        requiredElements: ['RLHF', 'Reward Model', 'PPO', 'Prompt Injection', 'guardrails']
      },
      explanation: 'RLHF aligns models with human intent, but robust input sanitation remains critical against prompt injections.'
    }
  ]
};
