// /api/create-checkout.js
import Stripe from 'stripe';

export default async function handler(req, res) {
  // Remplacez cette clé par votre clé secrète Stripe (qui commence par sk_test_...)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_VOTRE_CLE_SECRETE');

  if (req.method === 'POST') {
    try {
      // Créer la session Stripe Checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: req.body.line_items,
        mode: 'payment',
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/`,
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      console.error('Erreur Stripe:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}