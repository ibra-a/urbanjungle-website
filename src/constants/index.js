import { facebook, instagram, shieldTick, support, truckFast, twitter } from "../assets/icons";
import { bigShoe1, bigShoe2, bigShoe3, customer1, customer2, shoe4, shoe5, shoe6, shoe7, thumbnailShoe1, thumbnailShoe2, thumbnailShoe3 } from "../assets/images";

export const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about-us", label: "About Us" },
    { href: "#products", label: "Products" },
    { href: "#contact-us", label: "Contact Us" },
];

export const shoes = [
    {
        thumbnail: thumbnailShoe1,
        bigShoe: bigShoe1,
    },
    {
        thumbnail: thumbnailShoe2,
        bigShoe: bigShoe2,
    },
    {
        thumbnail: thumbnailShoe3,
        bigShoe: bigShoe3,
    },
];

export const statistics = [
    { value: '1k+', label: 'Brands' },
    { value: '500+', label: 'Shops' },
    { value: '250k+', label: 'Customers' },
];

export const products = [
    {
        imgURL: shoe4,
        name: "Nike Air Jordan-01",
        price: "$200.20",
    },
    {
        imgURL: shoe5,
        name: "Nike Air Jordan-10",
        price: "$210.20",
    },
    {
        imgURL: shoe6,
        name: "Nike Air Jordan-100",
        price: "$220.20",
    },
    {
        imgURL: shoe7,
        name: "Nike Air Jordan-001",
        price: "$230.20",
    },
];

export const services = [
    {
        imgURL: truckFast,
        label: "Free shipping",
        subtext: "From all orders over $100"
    },
    {
        imgURL: shieldTick,
        label: "Secure Payment",
        subtext: "100% Secure payment using SSL"
    },
    {
        imgURL: support,
        label: "Love to help you",
        subtext: "Our support team is here to help you."
    },
];

export const reviews = [
    {
        imgURL: customer1,
        customerName: 'Morich Brown',
        rating: 4.5,
        feedback: "The attention to detail and the quality of the product exceeded my expectations. Highly recommended!"
    },
    {
        imgURL: customer2,
        customerName: 'Lota Mongeskar',
        rating: 4.5,
        feedback: "The product not only met but exceeded my expectations. I'll definitely be a returning customer!"
    }
];


export const footerLinks = [
    {
        title: "Shop",
        links: [
            { name: "All Products", link: "/shop" },
            { name: "Men", link: "/men" },
            { name: "Women", link: "/women" },
            { name: "Kids", link: "/kids" },
            { name: "Brands", link: "/brands" },
            { name: "Sale", link: "/shop?sale=true" },
        ],
    },
    {
        title: "Customer Service",
        links: [
            { name: "Contact Us", link: "/" },
            { name: "FAQs", link: "/" },
            { name: "Shipping Info", link: "/" },
            { name: "Returns", link: "/" },
            { name: "Track Order", link: "/" },
        ],
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy Policy", link: "/privacy-policy" },
            { name: "Terms & Conditions", link: "/terms-and-conditions" },
            { name: "About Us", link: "/" },
        ],
    },
];

export const socialMedia = [
    { src: instagram, alt: "instagram logo", platform: "instagram", url: "https://www.instagram.com/urbanjungledjibouti/" },
    { src: facebook, alt: "facebook logo", platform: "facebook", url: "https://www.facebook.com/people/Gab-Fashion-House/61581841153044/" },
    { src: "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' fill='currentColor'/%3E%3C/svg%3E", alt: "X logo", platform: "x", url: "#" }
];

// Export navigation data
export * from './navigation';
