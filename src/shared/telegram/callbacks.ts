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
        PARENTS: "child:parents",
        PARENTS_ADD: "child:parents_add",
        HISTORY: "child:history",
        EDIT: "child:edit",
    },
    ADMIN: {
        SEARCH: "admin:search",
        ACTIVE_VISITS: "admin:active_visits",
        TODAY: "admin:today",
        NEW_CLIENT: "admin:new_client",
        BACK: "admin:back",
    },
    VISIT: {
        START: "visit:start",
        CONFIRM: "visit:confirm",
        REJECT: "visit:reject",
        FINISH: "visit:finish",
    },
}   as const;