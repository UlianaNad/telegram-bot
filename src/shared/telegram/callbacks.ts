export const CALLBACKS = {
    HOME: {
        CHILDREN: "home:children",
        PRICES: "home:prices",
        ABOUT: "home:about",
        PROFILE: "home:profile",
    },
    CHILD: {
        CARD: "child:card",
        ADD: "child:add",
        BACK: "child:back",
    },
    ADMIN: {
        SEARCH: "admin:search",
        ACTIVE_VISITS: "admin:active_visits",
        TODAY: "admin:today",
        NEW_CLIENT: "admin:new_client",
    },
    VISIT: {
        START: "visit:start",
        CONFIRM: "visit:confirm",
        REJECT: "visit:reject",
        FINISH: "visit:finish",
    },
}   as const;