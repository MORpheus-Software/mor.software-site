import prisma from '@/lib/prisma';

export default async function JobFormsPage({ uid }: { uid: string }) {
  console.log(uid, 'uid');
  if (!uid) {
    return <p>User ID is required to view this page.</p>;
  }

  // Fetch JobForms for the provided user ID and include deliverables
  const jobForms = await prisma.jobForm.findMany({
    where: {
      userId: uid,
    },
    include: {
      deliverables: true, // Include the related deliverables
    },
  });

  return (
    <div>
      <h1>Your JobForms</h1>
      <ul>
        {jobForms.map((form) => (
          <li key={form.id}>
            <h2>{form.githubUsername}</h2>
            {/* <p>{form.description}</p> */}
            <h3>Deliverables:</h3>
            <ul>
              {form.deliverables.map((deliverable) => (
                <li key={deliverable.id}>
                  <p>Description: {deliverable.deliverableDescription}</p>
                  <p>Weight Requested: {deliverable.weightsRequested}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
