# API Endpoints & Integration Guide

## Cloud Function Endpoints

### Chat Endpoint

**Function**: `chat` (HTTP trigger)

**URL**: `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/chat`

**Method**: `POST`

**Request Body**:
```json
{
  "message": "What are your main skills?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ]
}
```

**Response**:
```json
{
  "response": "AI-generated answer based on portfolio data"
}
```

**Error Response**:
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

### Health Check Endpoint

**Function**: `health` (HTTP trigger)

**URL**: `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/health`

**Method**: `GET`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Firestore Collections & Documents

### Profile Collection

```
/profile/main
{
  avatarUrl: string,
  bio: string,
  email: string,
  github: string,
  resumeUrl: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

/profile/skills
{
  skills: array[string],
  updatedAt: timestamp
}
```

### Projects Collection

```
/projects/{projectId}
{
  title: string,
  description: string,
  category: string,
  tools: array[string],
  link: string,
  imageUrl: string,
  createdAt: timestamp
}
```

### Resources Collection

```
/resources/{resourceId}
{
  type: "pdf" | "excel" | "ppt" | "image" | "powerbi" | "link",
  name: string,
  description: string,
  url: string,
  fileName: string,
  embedUrl: string (for PowerBI),
  createdAt: timestamp
}
```

## Frontend Integration

### JavaScript Examples

#### Initialize Firebase
```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

#### Query Projects
```javascript
import { collection, getDocs, query, where } from "firebase/firestore";

const q = query(collection(db, "projects"), 
  where("category", "==", "data-analysis"));
const snapshot = await getDocs(q);
const projects = snapshot.docs.map(doc => doc.data());
```

#### Upload File to Storage
```javascript
import { storage } from "./firebase-config";

const fileRef = storage.ref(`projects/${file.name}`);
await fileRef.put(file);
const url = await fileRef.getDownloadURL();
```

#### Send Chat Message
```javascript
const response = await fetch(
  `https://REGION-PROJECT.cloudfunctions.net/chat`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Your question",
      conversationHistory: []
    })
  }
);
const data = await response.json();
console.log(data.response);
```

## CORS Configuration

### For Cloud Functions

Already configured in `functions/index.js`:
```javascript
res.set('Access-Control-Allow-Origin', '*');
res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.set('Access-Control-Allow-Headers', 'Content-Type');
```

### For Firebase Storage

If needed, add CORS configuration:
```bash
gsutil cors set cors.json gs://YOUR_BUCKET
```

Where `cors.json`:
```json
[
  {
    "origin": ["https://YOUR_DOMAIN"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

## Rate Limiting & Quotas

### Cloud Functions Quotas
- **Invocations**: 125k/month (free tier)
- **Duration**: 60 seconds per execution
- **Memory**: 256MB default
- **Timeout**: 60 seconds

### Firestore Quotas
- **Document Size**: 1MB max
- **Batch Size**: 500 operations
- **Read Rate**: 50k reads/day (free tier)
- **Write Rate**: 20k writes/day (free tier)
- **Storage**: 1GB (free tier)

### Storage Quotas
- **File Size**: 5GB max
- **Upload Speed**: Up to 32MB/s
- **Storage**: 5GB (free tier)

## Deployment Regions

Cloud Functions available in regions:
- us-central1 (default)
- us-east1
- us-west2
- us-west3
- us-west4
- europe-west1
- asia-northeast1

Set in `.firebaserc` or during deployment:
```bash
firebase deploy --region us-east1
```

## Monitoring & Debugging

### View Function Logs
```bash
firebase functions:log
```

### Detailed Function Metrics
- Go to Firebase Console
- Functions
- Select function
- Logs and Metrics tabs

### Debug Locally
```bash
firebase emulators:start
# All logs printed to console
```

## Performance Optimization

### Tips
1. **Optimize Images**: Use WebP format, compress PDFs
2. **Cache Aggressively**: Set cache headers in Cloud Functions
3. **Batch Operations**: Use batch writes for multiple documents
4. **Index Queries**: Add Firestore indexes for complex queries
5. **Function Tuning**: Adjust memory and timeout settings

### Example: Add Cache Headers
```javascript
res.set('Cache-Control', 'public, max-age=3600');
res.set('Content-Type', 'application/json');
```

## Security Best Practices

1. ✅ Never expose API keys in client code (use web API key)
2. ✅ Use Cloud Functions for sensitive operations
3. ✅ Set up proper Firestore rules
4. ✅ Store sensitive data encrypted
5. ✅ Rotate DeepSeek API key periodically
6. ✅ Monitor Cloud Function usage for unauthorized access

## Troubleshooting API Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 Not Found | Function not deployed | Run `firebase deploy --only functions` |
| 401 Unauthorized | Invalid Firebase config | Check credentials in firebase-config.js |
| CORS Error | Origin not allowed | Check CORS settings in functions |
| Timeout Error | Function takes too long | Optimize queries or increase timeout |
| Permission Denied | Firestore rules restrictive | Review security rules in Firebase Console |

## Testing APIs

### Using cURL
```bash
curl -X POST https://REGION-PROJECT.cloudfunctions.net/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","conversationHistory":[]}'
```

### Using Postman
1. Create POST request
2. Set URL to function endpoint
3. Add JSON body
4. Send and check response

### Using Python
```python
import requests

url = "https://REGION-PROJECT.cloudfunctions.net/chat"
data = {
    "message": "What are your skills?",
    "conversationHistory": []
}
response = requests.post(url, json=data)
print(response.json())
```
