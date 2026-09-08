import Stripe from "stripe";

const stripe = new Stripe(
    env.STRIPE_SECRET_KEY
);

const PRODUCTS = {

    "bq-eclat": {
        name: "Bouquet Éclat de Saison",
        price: 28
    },

    "bq-champetre": {
        name: "Bouquet Champêtre",
        price: 24
    },

    "bq-blanc": {
        name: "Bouquet Blanc Pur",
        price: 32
    },

    "bq-soleil": {
        name: "Bouquet Soleil",
        price: 22
    },

    "cp-vase": {
        name: "Composition Vase Rond",
        price: 35
    },

    "cp-corbeille": {
        name: "Corbeille Jardin",
        price: 40
    },

    "cp-duo": {
        name: "Duo de Roses",
        price: 30
    },

    "pl-orchidee": {
        name: "Orchidée Phalaenopsis",
        price: 26
    },

    "pl-pothos": {
        name: "Pothos Doré",
        price: 15
    },

    "pl-ficus": {
        name: "Ficus Lyrata",
        price: 45
    }

};


export default {

    async fetch(request, env) {

        const headers = {

            "Access-Control-Allow-Origin":
                "https://vertom12.github.io",

            "Access-Control-Allow-Headers":
                "Content-Type",

            "Access-Control-Allow-Methods":
                "POST, OPTIONS"

        };


        // Autorise le navigateur à faire la requête
        if (request.method === "OPTIONS") {

            return new Response(null, {
                headers: headers
            });

        }


        // Vérification de la route
        const url = new URL(request.url);

        if (
            url.pathname !==
            "/create-checkout-session"
        ) {

            return new Response(
                "Page introuvable",
                {
                    status: 404,
                    headers: headers
                }
            );

        }


        if (request.method !== "POST") {

            return new Response(
                "Méthode non autorisée",
                {
                    status: 405,
                    headers: headers
                }
            );

        }


        try {

            const data =
                await request.json();


            const items = data.items;


            if (
                !items ||
                !Array.isArray(items) ||
                items.length === 0
            ) {

                throw new Error(
                    "Panier invalide"
                );

            }


            const lineItems =
                items.map(function(item){

                    const product =
                        PRODUCTS[item.id];


                    if (!product) {

                        throw new Error(
                            "Produit invalide"
                        );

                    }


                    const quantity =
                        Number(item.quantity);


                    if (
                        !Number.isInteger(quantity) ||
                        quantity < 1 ||
                        quantity > 20
                    ) {

                        throw new Error(
                            "Quantité invalide"
                        );

                    }


                    return {

                        price_data: {

                            currency: "eur",

                            product_data: {

                                name:
                                    product.name

                            },

                            unit_amount:
                                product.price * 100

                        },

                        quantity:
                            quantity

                    };

                });


            const stripe =
                new Stripe(
                    env.STRIPE_SECRET_KEY
                );


            const customer =
                data.customer || {};


            const session =
                await stripe.checkout.sessions.create({

                    mode: "payment",

                    line_items:
                        lineItems,

                    success_url:
                        "https://vertom12.github.io/flower-market/?payment=success",

                    cancel_url:
                        "https://vertom12.github.io/flower-market/?payment=cancel",

                    metadata: {

                        customer_name:
                            customer.name || "",

                        customer_phone:
                            customer.phone || "",

                        pickup_date:
                            customer.date || "",

                        pickup_time:
                            customer.time || "",

                        notes:
                            customer.notes || ""

                    }

                });


            return new Response(

                JSON.stringify({

                    url:
                        session.url

                }),

                {

                    headers: {

                        ...headers,

                        "Content-Type":
                            "application/json"

                    }

                }

            );


        } catch(error) {

            console.error(error);


            return new Response(

                JSON.stringify({

                    error:
                        error.message

                }),

                {

                    status: 400,

                    headers: {

                        ...headers,

                        "Content-Type":
                            "application/json"

                    }

                }

            );

        }

    }

};