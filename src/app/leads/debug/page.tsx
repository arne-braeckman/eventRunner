export default function LeadsDebugPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Leads Debug Page</h1>
      <p>If you can see this page, the routing is working.</p>
      
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Next Steps:</h2>
        <ul className="list-disc list-inside mt-2">
          <li>Try visiting <a href="/leads" className="text-blue-600 underline">/leads</a></li>
          <li>Try visiting <a href="/leads/pipeline" className="text-blue-600 underline">/leads/pipeline</a></li>
          <li>Check browser console for any JavaScript errors</li>
          <li>Check if Convex is running and connected</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Technical Info:</h3>
        <p>Page rendered at: {new Date().toISOString()}</p>
        <p>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server Side'}</p>
      </div>
    </div>
  );
}