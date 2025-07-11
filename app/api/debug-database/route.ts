import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { ID } from 'node-appwrite';

export async function GET(request: NextRequest) {
    console.log('=== DATABASE DEBUG START ===');
    
    try {
        // Check environment variables
        const requiredVars = {
            NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
            NEXT_PUBLIC_APPWRITE_PROJECT: process.env.NEXT_PUBLIC_APPWRITE_PROJECT,
            NEXT_APPWRITE_KEY: process.env.NEXT_APPWRITE_KEY ? 'SET' : 'NOT SET',
            APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID,
            APPWRITE_USER_COLLECTION_ID: process.env.APPWRITE_USER_COLLECTION_ID,
            APPWRITE_BANK_COLLECTION_ID: process.env.APPWRITE_BANK_COLLECTION_ID,
        };
        
        console.log('Environment variables:', requiredVars);
        
        // Test admin client creation
        const { database, account } = await createAdminClient();
        console.log('Admin client created successfully');
        
        // Test database connection by listing collections
        try {
            const collections = await database.listCollections(process.env.APPWRITE_DATABASE_ID!);
            console.log('Database collections count:', collections.collections.length);
            console.log('Collections:', collections.collections.map(c => ({ id: c.$id, name: c.name })));
        } catch (dbError) {
            console.error('Database list collections error:', dbError);
        }
        
        // Test user collection access
        try {
            const userCollectionDocs = await database.listDocuments(
                process.env.APPWRITE_DATABASE_ID!,
                process.env.APPWRITE_USER_COLLECTION_ID!
            );
            console.log('User collection documents count:', userCollectionDocs.documents.length);
        } catch (userCollError) {
            console.error('User collection access error:', userCollError);
        }
        
        // Test creating a test document
        const testDocData = {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            address1: '123 Test St',
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            dateOfBirth: '1990-01-01',
            ssn: '123-45-6789',
            userId: 'test-user-id-' + Date.now(),
            dwollaCustomerId: 'test-customer-id',
            dwollaCustomerUrl: 'https://api-sandbox.dwolla.com/customers/test-customer-id',
        };
        
        try {
            console.log('Attempting to create test document with data:', testDocData);
            
            const testDoc = await database.createDocument(
                process.env.APPWRITE_DATABASE_ID!,
                process.env.APPWRITE_USER_COLLECTION_ID!,
                ID.unique(),
                testDocData
            );
            
            console.log('Test document created successfully:', testDoc.$id);
            
            // Clean up the test document
            try {
                await database.deleteDocument(
                    process.env.APPWRITE_DATABASE_ID!,
                    process.env.APPWRITE_USER_COLLECTION_ID!,
                    testDoc.$id
                );
                console.log('Test document cleaned up successfully');
            } catch (cleanupError) {
                console.log('Test document cleanup failed (not critical):', cleanupError);
            }
            
        } catch (createError: any) {
            console.error('Document creation error:', createError);
            console.error('Error details:', {
                message: createError?.message,
                code: createError?.code,
                type: createError?.type,
                response: createError?.response,
            });
        }
        
        console.log('=== DATABASE DEBUG END ===');
        
        return NextResponse.json({
            success: true,
            environment: requiredVars,
            databaseTest: 'Check console logs for detailed results',
            timestamp: new Date().toISOString(),
        });
        
    } catch (error: any) {
        console.error('=== DATABASE DEBUG ERROR ===');
        console.error('Database debug error:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        
        return NextResponse.json({
            success: false,
            error: error?.message || 'Unknown error',
            errorDetails: {
                code: error?.code,
                type: error?.type,
                response: error?.response,
            },
            timestamp: new Date().toISOString(),
        });
    }
}
