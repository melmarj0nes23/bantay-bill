import os

def main():
    # 1. Update types.ts
    types_file = "src/types.ts"
    with open(types_file, "r") as f:
        types_content = f.read()
    
    if "pushSubscriptions" not in types_content:
        types_content = types_content.replace(
            "role?: 'admin' | 'user';",
            "role?: 'admin' | 'user';\n  pushSubscriptions?: any[];"
        )
        with open(types_file, "w") as f:
            f.write(types_content)

    # 2. Update Bills.tsx
    bills_file = "src/pages/Bills.tsx"
    with open(bills_file, "r") as f:
        bills_content = f.read()

    # Import requestPushSubscription
    bills_content = bills_content.replace(
        "import { useAppContext } from '../context/AppContext';",
        "import { useAppContext } from '../context/AppContext';\nimport { requestPushSubscription } from '../utils/pushNotifications';"
    )

    # Update notifyDue toggle logic
    old_toggle_logic = """                    onChange={(e) => {
                      const updated = { ...userProfile, notifyDue: e.target.checked };
                      setUserProfile(updated);
                      // In a real scenario, this would trigger an immediate DB update 
                      // or wait for the "Save Preferences" button. We bind it to state.
                    }}"""
    
    new_toggle_logic = """                    onChange={async (e) => {
                      const checked = e.target.checked;
                      let pushSub = null;
                      if (checked) {
                        pushSub = await requestPushSubscription();
                      }
                      
                      const updated = { ...userProfile, notifyDue: checked };
                      if (pushSub) {
                        // Store it (in a real app, you would append it to the DB directly)
                        // Here we just add it to userProfile which gets saved when "Save Preferences" is clicked
                        updated.pushSubscriptions = [pushSub];
                      }
                      setUserProfile(updated);
                    }}"""
    
    bills_content = bills_content.replace(old_toggle_logic, new_toggle_logic)

    with open(bills_file, "w") as f:
        f.write(bills_content)

    # 3. Create api/cron.ts
    os.makedirs("api", exist_ok=True)
    cron_content = """import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Note: To use Firebase Admin in Vercel, you need a FIREBASE_SERVICE_ACCOUNT JSON string in env.
// For this prototype, we'll assume it exists or fail gracefully if not.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null;

if (serviceAccount && getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = serviceAccount ? getFirestore() : null;

// Configure Web Push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@example.com',
  process.env.VITE_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (!db) {
    return response.status(500).json({ error: 'Firebase Admin not configured in environment.' });
  }

  try {
    console.log('Cron Job Executing: Scanning for upcoming bills...');
    const usersSnapshot = await db.collection('users').get();
    let sentCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (!userData.notifyDue || !userData.pushSubscriptions || userData.pushSubscriptions.length === 0) continue;

      // Find user's bills
      const billsSnapshot = await db.collection('users').doc(userDoc.id).collection('bills').get();
      
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);

      for (const billDoc of billsSnapshot.docs) {
        const bill = billDoc.data();
        const dueDate = new Date(bill.dueDate);
        
        // Very basic check: If bill is Upcoming and due in <= 3 days
        if (bill.status === 'Upcoming' && dueDate <= threeDaysFromNow && dueDate >= now) {
          const payload = JSON.stringify({
            title: `Bill Due Soon: ${bill.name}`,
            body: `Your ${bill.name} bill of ${bill.amount} is due on ${bill.dueDate}.`,
            url: '/'
          });

          // Send to all subscriptions
          for (const sub of userData.pushSubscriptions) {
            try {
              await webpush.sendNotification(sub, payload);
              sentCount++;
            } catch (error) {
              console.error('Error sending push notification:', error);
              // Clean up invalid subscriptions if necessary
            }
          }
        }
      }
    }

    return response.status(200).json({ success: true, notificationsSent: sentCount });
  } catch (error) {
    console.error('Cron job error:', error);
    return response.status(500).json({ error: 'Failed to process push notifications.' });
  }
}
"""
    with open("api/cron.ts", "w") as f:
        f.write(cron_content)

    # 4. Create vercel.json
    vercel_json = """{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 8 * * *"
    }
  ]
}
"""
    with open("vercel.json", "w") as f:
        f.write(vercel_json)

if __name__ == "__main__":
    main()
