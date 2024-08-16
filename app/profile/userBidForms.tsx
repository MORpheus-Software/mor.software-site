import prisma from "@/lib/prisma";

export default async function BidFormsPage({ uid }: { uid: string }) {

  console.log(uid,'uid')
  if (!uid) {
    return <p>User ID is required to view this page.</p>;
  }

  // Fetch BidForms for the provided user ID
  const bidForms = await prisma.bidForm.findMany({
    where: {
      userId: uid,
    },
  });

  return (
    <div>
      <h1>Your BidForms</h1>
      <ul>
        {bidForms.map((form) => (
          <li key={form.id}>
            <h2>{form.githubUsername}</h2>
            <p>{form.description}</p>
            <p>Deliverables: {JSON.stringify(form.deliverableDescriptions)}</p>
            {/* Add more fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}
