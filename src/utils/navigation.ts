// An array of links for navigation bar
const navBarLinks = [
  { name: "Inicio", url: "/" },
  { name: "Productos", url: "/products" },
  { name: "Contacto", url: "/contact" },
];
// An array of links for footer
const footerLinks = [
  {
    section: "Productos y Servicios",
    links: [
      { name: "Catálogo de Productos", url: "/products" },
      { name: "Herramientas y Equipos", url: "/products/tools" },
      { name: "Materiales de Construcción", url: "/products/construction" },
    ],
  },
  {
    section: "Empresa",
    links: [
      { name: "Sobre FERREMAS", url: "/about" },
      { name: "Blog y Noticias", url: "/blog" },
      { name: "Trabaja con nosotros", url: "/careers" },
      { name: "Clientes y Testimonios", url: "/customers" },
    ],
  },
];
// An object of links for social icons
const socialLinks = {
  facebook: "https://www.facebook.com/ferremas",     // cambiar al real si existe
  instagram: "https://www.instagram.com/ferremas",   // cambiar al real si existe
  linkedin: "https://www.linkedin.com/company/ferremas", // opcional
  whatsapp: "https://wa.me/56912345678",             // número de contacto
  youtube: "https://www.youtube.com/@ferremas",       // si tienen canal
};

export default {
  navBarLinks,
  footerLinks,
  socialLinks,
};