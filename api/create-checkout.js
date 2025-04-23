import Stripe from 'stripe';

export default async function handler(req, res) {
  // Vérifiez que la clé secrète est bien chargée
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Clé Stripe non configurée' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-08-16'
  });

  if (req.method === 'POST') {
    try {
      // Transformer les line_items pour Stripe
      const lineItems = req.body.line_items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name || 'Parfum Premium',
          },
          unit_amount: Math.round(item.price * 100), // Convertir en centimes
        },
        quantity: item.quantity || 1,
      }));

      // Créer la session Stripe Checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/`,
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      console.error('Erreur Stripe détaillée:', error);
      res.status(500).json({ 
        error: 'Impossible de créer la session de paiement',
        details: error.message 
      });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Méthode non autorisée');
  }
}