'use client';

export default function DebugFirebase() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Firebase Debug Info</h1>
      
      <div className="space-y-2">
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_API_KEY:</strong>
          <pre className="bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '❌ NOT FOUND'}
          </pre>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:</strong>
          <pre className="bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ NOT FOUND'}
          </pre>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_PROJECT_ID:</strong>
          <pre className="bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ NOT FOUND'}
          </pre>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:</strong>
          <pre className="bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '❌ NOT FOUND'}
          </pre>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:</strong>
          <pre className="bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '❌ NOT FOUND'}
          </pre>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_APP_ID:</strong>
          <pre className="bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '❌ NOT FOUND'}
          </pre>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:</strong>
          <pre className="bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '❌ NOT FOUND'}
          </pre>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <strong>⚠️ Se alguma variável mostrar "❌ NOT FOUND":</strong>
        <ul className="list-disc list-inside mt-2">
          <li>Verifique se está configurada no Vercel</li>
          <li>Verifique se está marcada para "Production"</li>
          <li>Faça um redeploy após adicionar/editar variáveis</li>
        </ul>
      </div>
    </div>
  );
}


