# How to Use Persistent userInfo Store

## Problem Solved
Your `userInfo` data now persists across app reloads and refreshes, just like the `user` data.

## How It Works

### 1. **Data Persistence Flow**
- When user logs in → `userInfo` is saved to AsyncStorage + Zustand store
- When app starts → `userInfo` is loaded from AsyncStorage to Zustand store
- Data persists across app restarts, reloads, and refreshes

### 2. **Using userInfo in Your Components**

```typescript
import { useUserInfoStore } from "@/store/modules/userInfo";

const MyComponent = () => {
  // Get userInfo data
  const { userInfo, saveUserInfo, loadUserInfo } = useUserInfoStore();
  
  // Access userInfo data
  console.log(userInfo?.subscription);
  console.log(userInfo?.organizationName);
  console.log(userInfo?.zegoToken);
  
  // Update userInfo (automatically saves to AsyncStorage)
  const handleUpdate = async () => {
    await saveUserInfo({
      ...userInfo,
      subscription: "premium",
      organizationName: "New Organization"
    });
  };
  
  // Manually reload userInfo from AsyncStorage
  const handleRefresh = async () => {
    await loadUserInfo();
  };
  
  return (
    <div>
      <p>Subscription: {userInfo?.subscription}</p>
      <p>Organization: {userInfo?.organizationName}</p>
    </div>
  );
};
```

### 3. **Available Methods**

- `userInfo` - Current userInfo data (null if not loaded)
- `setUserInfo(data)` - Update store only (not persistent)
- `saveUserInfo(data)` - Update store AND save to AsyncStorage (persistent)
- `loadUserInfo()` - Load from AsyncStorage to store
- `clearUserInfo()` - Clear store only (not persistent)

### 4. **Data Structure**
```typescript
interface UserInfo {
  zegoToken?: string;
  subscription?: string;
  organizationName?: string;
  smollVetAccessStartDate?: string;
  smollVetAccessEndDate?: string;
}
```

## Key Benefits

✅ **Persistent**: Data survives app restarts, reloads, and refreshes  
✅ **Automatic**: Loads on app startup, saves on updates  
✅ **Consistent**: Same API as your existing user store  
✅ **Reliable**: Uses AsyncStorage for persistence  

## Usage in HomeScreen

Your existing HomeScreen code will now work with persistent data:

```typescript
const { userInfo } = useUserInfoStore();

// This data will now persist across app reloads!
console.log(userInfo?.subscription);
console.log(userInfo?.organizationName);
```
