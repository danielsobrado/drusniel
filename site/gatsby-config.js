module.exports = {
  plugins: [
    {
      resolve: '@elegantstack/gatsby-theme-flexiblog-beauty',
      options: {
        // Add theme options here. Check documentation for available options.
        siteUrl: process.env.URL || process.env.VERCEL_URL
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        icon: `content/assets/favicon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        excludes: ['/dev-404-page', '/404', '/404.html'],
      }
    },
    'gatsby-plugin-robots-txt',
  ],
  // Customize your site metadata:
  siteMetadata: {
    //General Site Metadata
    title: 'Drusniel',
    name: 'Arcane Paradox A.I.',
    description: 'Embark on a journey through worlds of magic and mystery with Arcane Paradox A.I.!',
    siteUrl: process.env.URL || process.env.VERCEL_URL || 'https://drusniel.com',
    address: 'Denpasar, Bali, 80263',
    email: 'daniel@danielsobrado.com',
    phone: '',

    //Site Social Media Links
    social: [
      {
        name: 'Github',
        url: 'https://github.com/danielsobrado/drusniel-voxels'
      },
      {
        name: 'Twitter',
        url: 'https://twitter.com/JDanielSob'
      },
      {
        name: 'Instagram',
        url: 'https://www.instagram.com/arcane_paradox_ai/'
      }
    ],

    //Header Menu Items
    headerMenu: [
      {
        name: 'Home',
        slug: '/'
      },
      {
        name: 'Characters',
        slug: '/authors'
      },
      {
        name: 'Read',
        slug: '/read'
      },
      {
        name: 'Contact',
        slug: '/contact'
      }

    ],

    //Footer Menu Items (2 Sets)
    footerMenu: [
      {
        title: 'Quick Links',
        items: [
          {
            name: 'Advertise with us',
            slug: '/contact'
          },
          {
            name: 'About Us',
            slug: '/about'
          },
          {
            name: 'Contact Us',
            slug: '/contact'
          }
        ]
      },
      {
        title: 'Legal Stuff',
        items: [
          {
            name: 'Privacy Notice',
            slug: '/'
          },
          {
            name: 'Cookie Policy',
            slug: '/'
          },
          {
            name: 'Terms Of Use',
            slug: '/'
          }
        ]
      }
    ]
  }
}
