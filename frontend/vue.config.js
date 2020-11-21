module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
    ? '/post-it'
    : '/',
    css: {
      loaderOptions: {
        sass: {
          prependData: `
            @import "@/scss_variables.scss";
          `
        }
      }
    },
    pwa: {
    	name: 'Post-it Game',
    	themeColor: '#4a91f2',
    	appleMobileWebAppCapable: 'yes',
    	appleMobileWebAppStatusBarStyle: 'black',
    	iconPaths: {
    	    favicon32: 'img/icons/favicon-32x32.png',
    	    favicon16: 'img/icons/favicon-16x16.png',
    	    appleTouchIcon: 'img/icons/apple-icon.png'
            },
    	manifestOptions: {
    	    short_name: 'Post-It',
    	    background_color: '#3b7dd8',
    	    icons: [
                    {
                        'src': 'img/icons/android-chrome-192x192.png',
                        'sizes': '192x192',
                        'type': 'image/png',
                    }
                ]
    	}
    },
    chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        args[0].title = 'Post-it';
        return args;
      });
  }
};
