export default function CampaignForm() {
  return (
    <form>
      <input type="text" placeholder="Campaign Name" />
      <textarea placeholder="Campaign Description"></textarea>
      <input
        type="date"
        placeholder="Campaign Start Date"
        min={new Date().toISOString().split("T")[0]}
      />
      <input
        type="date"
        placeholder="Campaign End Date"
        min={new Date().toISOString().split("T")[0]}
      />

      <button type="submit">Create Campaign</button>
    </form>
  );
}
