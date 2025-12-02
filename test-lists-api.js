const fetch = require('node-fetch');

async function testListsAPI() {
  console.log('Testing Lists API...');

  try {
    // Test GET /api/lists
    console.log('\\n1. Testing GET /api/lists');
    const getResponse = await fetch('http://localhost:3000/api/lists');
    console.log('GET /api/lists status:', getResponse.status);
    const lists = await getResponse.json();
    console.log('Lists:', JSON.stringify(lists, null, 2));

    // Test POST /api/lists
    console.log('\\n2. Testing POST /api/lists');
    const postResponse = await fetch('http://localhost:3000/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test List',
        color: '#ff0000',
        icon: '📝'
      }),
    });
    console.log('POST /api/lists status:', postResponse.status);
    const newList = await postResponse.json();
    console.log('New list:', JSON.stringify(newList, null, 2));

    // Test GET /api/lists/default
    console.log('\\n3. Testing GET /api/lists/default');
    const defaultResponse = await fetch('http://localhost:3000/api/lists/default');
    console.log('GET /api/lists/default status:', defaultResponse.status);
    const defaultList = await defaultResponse.json();
    console.log('Default list:', JSON.stringify(defaultList, null, 2));

    // Test PUT /api/lists
    console.log('\\n4. Testing PUT /api/lists');
    const putResponse = await fetch('http://localhost:3000/api/lists', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: newList.id,
        title: 'Updated Test List'
      }),
    });
    console.log('PUT /api/lists status:', putResponse.status);
    const updatedList = await putResponse.json();
    console.log('Updated list:', JSON.stringify(updatedList, null, 2));

    // Test DELETE /api/lists
    console.log('\\n5. Testing DELETE /api/lists');
    const deleteResponse = await fetch('http://localhost:3000/api/lists', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: newList.id
      }),
    });
    console.log('DELETE /api/lists status:', deleteResponse.status);
    const deleteResult = await deleteResponse.json();
    console.log('Delete result:', JSON.stringify(deleteResult, null, 2));

    console.log('\\nAll API tests completed!');

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testListsAPI();