const handleClick = async () => {
  await fetch("/api/logout");
  window.location.reload();
};

export default function LogOut() {
  return (
    <button
      className="flex-no-grow flex-no-shrink relative py-2 px-4 leading-normal text-foreground no-underline flex items-center hover:bg-background"
      onClick={handleClick}
    >
      Logout
    </button>
  );
}
