//------------------------------------------------------------------------
async function postData(url = '', data = {}) {

    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    try {
        const resp = await response.json();
        return resp;
    } catch (error) {
        console.log('Error in postData', error);
    }

}

export {postData}