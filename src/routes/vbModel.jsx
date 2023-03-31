import { Form, useLoaderData, useFetcher } from 'react-router-dom';

export async function action({ request, params }) {
  let formData = await request.formData();
  return updateContact(params.contactId, {
    favorite: formData.get('favorite') === 'true',
  });
}

export default function VbModel() {
  return (
    <div id='vb-model'>
      <p>Hello world</p>
    </div>
  );
}
