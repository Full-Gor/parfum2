import Stripe from 'stripe';

export default async function handler(req, res) {
  // Log initial de la requête
  console.log('Requête reçue:', {
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  // Vérification de la clé secrète
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('ERREUR CRITIQUE : Clé Stripe non configurée');
    return res.status(500).json({ error: 'Clé Stripe non configurée' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-08-16'
  });

  if (req.method === 'POST') {
    try {
      // Log détaillé des line_items avant transformation
      console.log('Line Items reçus:', JSON.stringify(req.body.line_items, null, 2));

      const lineItems = req.body.line_items.map(item => {
        // Log de chaque transformation d'item
        console.log('Transformation de l\'item:', item);

        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.price_data?.product_data?.name || 'Parfum Premium',
            },
            unit_amount: item.price_data?.unit_amount || Math.round(item.price * 100),
          },
          quantity: item.quantity || 1,
        };
      });

      // Log des line_items transformés
      console.log('Line Items transformés:', JSON.stringify(lineItems, null, 2));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/`,
      });

      // Log de la session créée
      console.log('Session Stripe créée:', session.id);

      res.status(200).json({ id: session.id });
    } catch (error) {
      // Log détaillé de l'erreur
      console.error('Erreur Stripe complète:', {
        message: error.message,
        stack: error.stack,
        type: error.type,
        code: error.code,
        raw: error.raw
      });

      res.status(500).json({ 
        error: 'Impossible de créer la session de paiement',
        details: error.message,
        type: error.type
      });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Méthode non autorisée');
  }
}