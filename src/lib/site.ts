export const site = {
  name: "Flores Systems",
  description:
    "Sitios web expresivos y sistemas administrativos claros para pequeños negocios en crecimiento.",
  whatsapp: "https://wa.me/51986132628",
  email: "flores.anthony.489@gmail.com",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    "http://localhost:3000",
  booking: process.env.NEXT_PUBLIC_BOOKING_URL?.startsWith("https://cal.com/")
    ? process.env.NEXT_PUBLIC_BOOKING_URL
    : undefined,
};
