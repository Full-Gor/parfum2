import Stripe from 'stripe';

export default async function handler(req, res) {
  // Logs de débogage très détaillés
  console.log('Requête reçue:', {
    method: req.method,
    body: JSON.stringify(req.body, null, 2),
    headers: req.headers
  });

  // Vérification de la clé Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('ERREUR CRITIQUE : Clé Stripe non configurée');
    return res.status(500).json({ 
      error: 'Clé Stripe non configurée',
      details: 'La variable STRIPE_SECRET_KEY est manquante'
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10' // Utilisez la version la plus récente
  });

  if (req.method === 'POST') {
    try {
      // Transformation très sécurisée des line_items
      const lineItems = req.body.line_items.map(item => {
        console.log('Transformation de l\'item:', JSON.stringify(item, null, 2));

        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.price_data?.product_data?.name 
                   || item.name 
                   || 'Parfum Premium',
            },
            unit_amount: item.price_data?.unit_amount 
                       || Math.round((item.price || 0) * 100),
          },
          quantity: item.quantity || 1,
        };
      });

      console.log('Line Items transformés:', JSON.stringify(lineItems, null, 2));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.origin || 'https://your-site.com'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'https://your-site.com'}/`,
      });

      console.log('Session Stripe créée:', session.id);

      res.status(200).json({ id: session.id });
    } catch (error) {
      // Log détaillé de l'erreur
      console.error('Erreur Stripe complète:', {
        message: error.message,
        stack: error.stack,
        type: error.type,
        code: error.code,
        raw: JSON.stringify(error.raw, null, 2)
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