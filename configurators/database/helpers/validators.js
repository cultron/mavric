module.exports = {
    slug: {
        isLowercase: true,
        len: { args: [ 1, 50 ], msg: 'Slug must be less than 50 characters' }
    },
    website: {
        is: {
            args: [ /^https?:\/\/.+/ ],
            msg: 'website must start with "http://" or "https://"'
        }
    },
    url: {
        is: {
            args: [ /^https?:\/\/.+/ ],
            msg: 'URL must start with "https://"'
        }
    }
};
