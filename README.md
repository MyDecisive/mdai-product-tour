# MDAI Product Tour

MyDecisive AI official Product Tour

# Local Development

Before running the site, be sure to copy `.env` to `.env.local` and enter the appropriate values. You should be able to get these from the [repository actions variables](https://github.com/DecisiveAI/site/settings/variables/actions) or from a team member.

To run this site locally, simply run the following in a terminal at the root of this repo:

```
npm i
npm start
```

If everything worked, `Local:   http://localhost:5173/` or similar should appear with the appropriate address!

To sync linting and type checks to this repo's configs:

1. Open a .ts or .tsx file
2. In the bottom right corner of VS Code you should see a `{}` and `TypeScript` next to one another.
3. Click on the `{}`, in the menu that pops up, click on `Select Version`. In the menu that opens from that (should be at the top of your screen) select the `Use workspace version` option.

## Bootstrapped project

This project was bootstrapped with [Vite](https://vitejs.dev/)

## Libraries

- [MUI](https://mui.com/material-ui/getting-started/) - Material UI is an open-source React component library that implements Google's Material Design. It's comprehensive and can be used in production out of the box.
- [mui-tel-input](https://github.com/viclafouch/mui-tel-input): Used for contact form. A phone number input designed for use with Material UI, built with [libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js).
- [typed.js](https://mattboldt.github.io/typed.js/docs/): Typed.js is a library that types. Used terminal animations.
