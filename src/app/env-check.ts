console.log('=== BUILD TIME ENV CHECK ===');
console.log('NEXT_PUBLIC_ABLY_API_KEY:', process.env.NEXT_PUBLIC_ABLY_API_KEY ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('================================');

export {};
