/**
 * Bidding Intelligence & Quote Recommendation Engine for Jai Bhavani Cargo
 * 
 * Analyzes historical bidding data with recency weighting and multi-factor prioritization:
 * 1. Exact Counterparty & Role
 * 2. Underlying Client
 * 3. Origin & Destination Corridor
 * 4. Truck Type & Payload
 * 5. Historical Win Rates & Actual Winning Rates
 * 
 * Delivers 3 Actionable Strategies:
 * - Aggressive (High Win Rate, Tight Margin)
 * - Balanced (Optimal Win Rate + Healthy Profit)
 * - Profit-Max (High Margin)
 */

// Helper to normalize strings for comparison
export const norm = (str) => (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

/**
 * Calculates similarity between two route records
 */
export const calculateRouteSimilarity = (originA, destA, originB, destB, distA, distB) => {
  const normOA = norm(originA);
  const normDA = norm(destA);
  const normOB = norm(originB);
  const normDB = norm(destB);

  // Exact match
  if (normOA === normOB && normDA === normDB) {
    return { isExact: true, matchType: 'Exact Route', similarity: 1.0 };
  }

  // Reverse / return direction
  if (normOA === normDB && normDA === normOB) {
    return { isExact: false, matchType: 'Return Corridor', similarity: 0.85 };
  }

  // Distance similarity (within 15% distance)
  if (distA > 0 && distB > 0) {
    const diff = Math.abs(distA - distB);
    const pctDiff = diff / Math.max(distA, distB);
    if (pctDiff <= 0.15) {
      return { isExact: false, matchType: 'Similar Distance & Region', similarity: Math.max(0.6, 1 - pctDiff) };
    }
  }

  return { isExact: false, matchType: 'Regional Benchmark', similarity: 0.4 };
};

/**
 * Calculate recommended quotes with transparent explainability
 */
export const calculateBidRecommendation = ({
  historicalBids = [],
  bidType = 'Spot', // 'Spot' (One Load) or 'Contract' (Dedicated / Monthly)
  monthlyTrips = 1,
  dedicatedTrucks = 1,
  contractMonths = 12,
  counterparty = '',
  counterpartyRole = 'Broker',
  underlyingClient = '',
  origin = '',
  destination = '',
  truckType = '20FT SXL',
  payloadTons = 6,
  distanceKm = 590,
  minProfitableBid = 0,
  tripCost = 0,
}) => {
  if (!origin || !destination) {
    return {
      hasData: false,
      confidence: 'LOW',
      confidenceText: 'Please select origin and destination to analyze historical rates.',
      recommended: 0,
      aggressive: 0,
      balanced: 0,
      profitMax: 0,
      bidType,
      monthlyTrips: Number(monthlyTrips || 1),
      monthlyRevenue: 0,
      monthlyProfit: 0,
      annualValue: 0,
      totalMonthlyKm: 0,
      historicalRange: { min: 0, max: 0, avg: 0 },
      comparableCount: 0,
      exactMatches: 0,
      similarMatches: 0,
      winRate: 0,
      explanations: [],
      matchedBids: []
    };
  }

  const isContract = bidType === 'Contract' || Number(monthlyTrips) > 1;
  const numMonthlyTrips = Math.max(1, Number(monthlyTrips) || (isContract ? 15 : 1));
  const totalMonthlyKm = numMonthlyTrips * Number(distanceKm || 0);

  const now = new Date();
  const scoredBids = [];

  // Filter and score historical bids
  historicalBids.forEach(bid => {
    // Basic validity check
    const bidRate = Number(bid.quoted_amount || bid.quoted_rate || bid.rate || 0);
    const actualWinRate = Number(bid.actual_winning_rate || (bid.result === 'Won' ? bidRate : 0));
    const effectiveRate = actualWinRate > 0 ? actualWinRate : bidRate;
    if (effectiveRate <= 0) return;

    const routeMatch = calculateRouteSimilarity(
      origin,
      destination,
      bid.origin,
      bid.destination,
      distanceKm,
      Number(bid.distance_km || bid.distance || 0)
    );

    // Score factors
    let matchScore = 0;
    const reasons = [];

    // 1. Route match score (35 pts max)
    if (routeMatch.isExact) {
      matchScore += 35;
      reasons.push('Exact Route');
    } else {
      matchScore += Math.round(routeMatch.similarity * 22);
      reasons.push(routeMatch.matchType);
    }

    // 2. Bid Type match (Spot vs Contract) (15 pts max)
    const bIsContract = bid.bid_type === 'Contract' || (Number(bid.trips_count) > 1) || (Number(bid.monthly_trips) > 1);
    if (isContract === bIsContract) {
      matchScore += 15;
      reasons.push(isContract ? 'Contract History' : 'Spot Load');
    }

    // 3. Counterparty & Role match (15 pts max)
    if (norm(bid.counterparty) === norm(counterparty) && counterparty) {
      matchScore += 10;
      if (norm(bid.role) === norm(counterpartyRole)) {
        matchScore += 5;
        reasons.push('Same Party & Role');
      } else {
        reasons.push('Same Counterparty');
      }
    }

    // 4. Underlying client match (10 pts max)
    if (underlyingClient && norm(bid.underlying_client) === norm(underlyingClient)) {
      matchScore += 10;
      reasons.push(`Client: ${underlyingClient}`);
    }

    // 5. Truck type & Payload match (15 pts max)
    if (norm(bid.truck_type || bid.vehicle_type) === norm(truckType)) {
      matchScore += 10;
      reasons.push(`Same Truck (${truckType})`);
    }
    const bidPayload = Number(bid.payload_tons || bid.payload || 0);
    if (payloadTons > 0 && bidPayload > 0 && Math.abs(payloadTons - bidPayload) <= 1.5) {
      matchScore += 5;
      reasons.push(`Payload ~${bidPayload}T`);
    }

    // 6. Recency weighting (10 pts max)
    const bidDate = new Date(bid.bid_date || bid.created || bid.date || now);
    const monthsAgo = Math.max(0, (now.getTime() - bidDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const recencyWeight = Math.max(0.4, 1 - (monthsAgo / 12));
    matchScore += Math.round(recencyWeight * 10);

    // 7. Outcome weight
    const isWon = bid.result === 'Won' || bid.status === 'Won' || bid.status === 'Active Contract';
    const isLostWithActual = bid.result === 'Lost' && Number(bid.actual_winning_rate) > 0;
    const outcomeWeight = isWon ? 1.4 : isLostWithActual ? 1.2 : 0.8;

    if (matchScore >= 20) {
      scoredBids.push({
        ...bid,
        effectiveRate,
        isWon,
        matchScore,
        reasons,
        recencyWeight,
        outcomeWeight,
        isExactRoute: routeMatch.isExact,
        isContractBid: bIsContract,
        finalWeight: matchScore * recencyWeight * outcomeWeight
      });
    }
  });

  // 1. Exact or Closely Matched Corridor Bids
  const exactCorridorBids = scoredBids.filter(b => b.isExactRoute);
  const relevantBids = exactCorridorBids.length > 0 ? exactCorridorBids : scoredBids;

  // 2. Lost Bid Intelligence (Competitor Winning Rates)
  const lostWithWinningRates = relevantBids.filter(b => (b.result === 'Lost' || b.status === 'Lost') && Number(b.actual_winning_rate) > 0);
  let competitorCeilingRate = null;
  let mostRecentLostInfo = null;

  if (lostWithWinningRates.length > 0) {
    const sortedLost = [...lostWithWinningRates].sort((a, b) => Number(a.actual_winning_rate) - Number(b.actual_winning_rate));
    competitorCeilingRate = Number(sortedLost[0].actual_winning_rate);
    mostRecentLostInfo = sortedLost[0];
  }

  // 3. Won Historical Bids for Pricing Anchor
  const wonBids = relevantBids.filter(b => b.isWon);

  let baseRate = 0;
  let calculationMethod = '';
  const explanations = [];

  if (wonBids.length > 0) {
    let totalKmWeight = 0;
    let ratePerKmSum = 0;

    wonBids.forEach(b => {
      const bDist = Number(b.distance_km || distanceKm || 1);
      const bRate = Number(b.actual_winning_rate || b.quoted_amount || 0);
      const bRatePerKm = bRate / Math.max(1, bDist);
      const bPayload = Number(b.payload_tons || 6);

      const payloadRatio = payloadTons > 0 && bPayload > 0 ? (1 + ((payloadTons - bPayload) * 0.03)) : 1;
      const adjustedRatePerKm = bRatePerKm * payloadRatio;

      ratePerKmSum += adjustedRatePerKm * b.finalWeight;
      totalKmWeight += b.finalWeight;
    });

    const avgRatePerKm = ratePerKmSum / totalKmWeight;
    baseRate = Math.round((distanceKm * avgRatePerKm) / 100) * 100;
    calculationMethod = isContract ? 'Historical Contract Benchmarks' : 'Historical Won Bids on Corridor';
    explanations.push(
      `Based on ${wonBids.length} past won ${isContract ? 'contract' : 'spot'} bid${wonBids.length > 1 ? 's' : ''} (Avg: ₹${avgRatePerKm.toFixed(2)}/KM for ${truckType}, ${payloadTons}T)`
    );
  } else if (relevantBids.length > 0) {
    let ratePerKmSum = 0;
    let totalWeight = 0;
    relevantBids.forEach(b => {
      const bDist = Number(b.distance_km || distanceKm || 1);
      const bRate = Number(b.effectiveRate || 0);
      ratePerKmSum += (bRate / Math.max(1, bDist)) * b.finalWeight;
      totalWeight += b.finalWeight;
    });
    const avgRatePerKm = ratePerKmSum / totalWeight;
    baseRate = Math.round((distanceKm * avgRatePerKm) / 100) * 100;
    calculationMethod = 'Historical Corridor Market Rates';
    explanations.push(
      `Derived from ${relevantBids.length} historical quotes on corridor (${origin} ➔ ${destination}, ${distanceKm} KM @ ₹${avgRatePerKm.toFixed(2)}/KM)`
    );
  } else {
    // Operating Cost-Plus Base Rate
    const baselineCost = tripCost > 0 ? tripCost : (distanceKm * 32);
    const targetMargin = isContract ? 1.12 : 1.15; // Contract bids have higher volume certainty, tighter trip margin
    baseRate = Math.round((baselineCost * targetMargin) / 100) * 100;
    calculationMethod = isContract ? 'Contract Volume Cost + 12% Margin' : 'Spot Operating Cost + 15% Margin';
    explanations.push(
      `Calculated from vehicle operating cost for ${distanceKm} KM @ ₹${(baseRate / distanceKm).toFixed(2)}/KM (${truckType}, ${payloadTons}T)`
    );
  }

  // Volume Adjustment for High-Frequency Contracts
  if (isContract && numMonthlyTrips >= 15) {
    // Volume discount on high recurring volume
    const volumeDiscountRatio = numMonthlyTrips >= 30 ? 0.96 : 0.98;
    baseRate = Math.round((baseRate * volumeDiscountRatio) / 100) * 100;
    explanations.push(
      `📊 Contract Volume Economics: Amortized fixed costs across ${numMonthlyTrips} monthly trips (${totalMonthlyKm.toLocaleString('en-IN')} KM/month)`
    );
  }

  // Strategic Tiers Derived Strictly from Baseline Rate
  let balanced = Math.max(baseRate, minProfitableBid ? Math.round((minProfitableBid * 1.05) / 100) * 100 : 0);
  let aggressive = Math.round((balanced * 0.95) / 100) * 100;
  let profitMax = Math.round((balanced * 1.08) / 100) * 100;

  // Apply Lost Bid Intelligence (Competitor Ceiling)
  if (competitorCeilingRate && competitorCeilingRate > 0) {
    const competitiveQuote = Math.round((competitorCeilingRate - 500) / 100) * 100;
    if (competitiveQuote >= (minProfitableBid || tripCost * 1.04)) {
      aggressive = competitiveQuote;
    } else {
      aggressive = Math.max(minProfitableBid, competitorCeilingRate);
    }

    explanations.unshift(
      `🎯 Lost Bid Intelligence: Previous ${isContract ? 'contract' : 'spot'} bid was lost to competitor at ₹${competitorCeilingRate.toLocaleString('en-IN')}${mostRecentLostInfo?.lost_reason ? ` (${mostRecentLostInfo.lost_reason})` : ''}. Aggressive tier adjusted to ₹${aggressive.toLocaleString('en-IN')} to win.`
    );
  }

  // Ensure minimum profitable bid floor
  if (minProfitableBid > 0) {
    aggressive = Math.max(aggressive, minProfitableBid);
    balanced = Math.max(balanced, Math.round((minProfitableBid * 1.04) / 100) * 100);
    profitMax = Math.max(profitMax, Math.round((minProfitableBid * 1.10) / 100) * 100);
  }

  // Calculate Monthly & Annual Contract Projections
  const perTripCost = tripCost > 0 ? tripCost : (distanceKm * 30);
  const monthlyRevenue = balanced * numMonthlyTrips;
  const monthlyTripCost = perTripCost * numMonthlyTrips;
  const monthlyProfit = monthlyRevenue - monthlyTripCost;
  const annualValue = monthlyRevenue * Number(contractMonths || 12);

  const confidence = relevantBids.length >= 4 ? 'HIGH' : relevantBids.length >= 1 ? 'MEDIUM' : 'LOW';

  return {
    hasData: relevantBids.length > 0,
    confidence,
    calculationMethod,
    bidType,
    isContract,
    monthlyTrips: numMonthlyTrips,
    totalMonthlyKm,
    monthlyRevenue,
    monthlyProfit,
    annualValue,
    ratePerKm: (balanced / Math.max(1, distanceKm)).toFixed(2),
    recommended: balanced,
    aggressive,
    balanced,
    profitMax,
    historicalRange: {
      min: Math.min(...relevantBids.map(b => b.effectiveRate || balanced), aggressive),
      max: Math.max(...relevantBids.map(b => b.effectiveRate || balanced), profitMax),
      avg: balanced
    },
    comparableCount: relevantBids.length,
    exactMatches: exactCorridorBids.length,
    winRate: relevantBids.length > 0 ? Math.round((wonBids.length / relevantBids.length) * 100) : 0,
    lostBidIntelligence: {
      hasLostData: !!competitorCeilingRate,
      competitorCeilingRate,
      mostRecentLostInfo
    },
    explanations,
  };
};

/**
 * Calculates Multi-Dimensional Bid Decision Score (0 - 100)
 */
export const calculateBidDecisionScore = ({
  quotedRate,
  recommendedRate,
  tripCost,
  returnLoadAvailable = false,
  confidence = 'MEDIUM'
}) => {
  if (!quotedRate || quotedRate <= 0 || !tripCost || tripCost <= 0) {
    return { score: 70, verdict: 'CONSIDER', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40', reasons: ['Enter quote and trip distance to evaluate'] };
  }

  const profit = quotedRate - tripCost;
  const marginPct = (profit / quotedRate) * 100;
  let score = 50;
  const reasons = [];

  // Profit Margin Component (Max 40 pts)
  if (marginPct >= 20) {
    score += 40;
    reasons.push(`Strong profit margin of ${marginPct.toFixed(1)}% (₹${profit.toLocaleString('en-IN')})`);
  } else if (marginPct >= 14) {
    score += 30;
    reasons.push(`Healthy margin of ${marginPct.toFixed(1)}%`);
  } else if (marginPct >= 8) {
    score += 15;
    reasons.push(`Tight margin of ${marginPct.toFixed(1)}%`);
  } else if (marginPct > 0) {
    score += 5;
    reasons.push(`Low margin (${marginPct.toFixed(1)}%) — risk of cost overrun`);
  } else {
    score -= 30;
    reasons.push(`Loss-making quote: ₹${Math.abs(profit).toLocaleString('en-IN')} below trip operating cost!`);
  }

  // Win Probability / Market Competitive Rate (Max 30 pts)
  if (recommendedRate > 0) {
    const diffPct = ((quotedRate - recommendedRate) / recommendedRate) * 100;
    if (Math.abs(diffPct) <= 3) {
      score += 30;
      reasons.push('Quoted rate aligns perfectly with historical winning market rate');
    } else if (diffPct < -3) {
      score += 25;
      reasons.push('Highly competitive rate — higher chance of winning');
    } else if (diffPct <= 8) {
      score += 15;
      reasons.push('Slightly above market average — may require negotiation');
    } else {
      score -= 10;
      reasons.push('Quoted significantly above market average — higher risk of loss');
    }
  }

  // Return Load / Backhaul Bonus (Max 15 pts)
  if (returnLoadAvailable) {
    score += 15;
    reasons.push('Return load secured — ensures high fleet asset utilization');
  } else {
    reasons.push('Empty return considered in trip cost model');
  }

  // Confidence Factor (Max 15 pts)
  if (confidence === 'HIGH') {
    score += 15;
  } else if (confidence === 'MEDIUM') {
    score += 10;
  } else {
    score += 5;
  }

  score = Math.max(10, Math.min(100, score));

  let verdict = 'CONSIDER';
  let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  if (score >= 80 && marginPct >= 10) {
    verdict = 'BID';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (score < 50 || marginPct <= 0) {
    verdict = "DON'T BID";
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  }

  return {
    score,
    verdict,
    badgeColor,
    marginPct: Number(marginPct.toFixed(1)),
    profit,
    reasons
  };
};

/**
 * Summary KPI Metrics for Bidding Dashboard
 */
export const calculateBiddingSummary = (bids = []) => {
  const totalBids = bids.length;
  let wonCount = 0;
  let lostCount = 0;
  let notBiddedCount = 0;
  let underReviewCount = 0;

  let totalBiddedAmount = 0;
  let totalWonAmount = 0;
  let totalLostOpportunity = 0;

  let totalLostPriceGap = 0;
  let lostWithLostAtCount = 0;

  bids.forEach(b => {
    const status = (b.status || 'Not bidded').trim();
    const bidAmt = Number(b.bidding_amount || b.quoted_amount || 0);
    const lostAt = Number(b.bidding_lost_at || b.actual_winning_rate || 0);

    if (status === 'Won') {
      wonCount++;
      totalWonAmount += bidAmt;
      totalBiddedAmount += bidAmt;
    } else if (status === 'Lost') {
      lostCount++;
      totalLostOpportunity += bidAmt;
      totalBiddedAmount += bidAmt;
      if (lostAt > 0 && bidAmt > 0) {
        totalLostPriceGap += Math.max(0, bidAmt - lostAt);
        lostWithLostAtCount++;
      }
    } else if (status === 'Not bidded') {
      notBiddedCount++;
    } else {
      underReviewCount++;
      if (bidAmt > 0) totalBiddedAmount += bidAmt;
    }
  });

  const decisiveBids = wonCount + lostCount;
  const winRatePct = decisiveBids > 0 ? Number(((wonCount / decisiveBids) * 100).toFixed(1)) : 0;
  const lossRatePct = decisiveBids > 0 ? Number(((lostCount / decisiveBids) * 100).toFixed(1)) : 0;

  const avgLostPriceGap = lostWithLostAtCount > 0 ? Math.round(totalLostPriceGap / lostWithLostAtCount) : 0;
  const avgBidAmount = (wonCount + lostCount + underReviewCount) > 0 
    ? Math.round(totalBiddedAmount / (wonCount + lostCount + underReviewCount)) 
    : 0;

  return {
    totalBids,
    wonCount,
    lostCount,
    notBiddedCount,
    underReviewCount,
    decisiveBids,
    winRatePct,
    lossRatePct,
    totalBiddedAmount,
    totalWonAmount,
    totalLostOpportunity,
    avgLostPriceGap,
    avgBidAmount
  };
};

/**
 * Breakdown of win rate and pricing variance by Vehicle Type
 */
export const getVehicleTypeBreakdown = (bids = []) => {
  const map = {};

  bids.forEach(b => {
    const vType = (b.vehicle_type || b.truck_type || '32FTSXL').trim();
    if (!map[vType]) {
      map[vType] = {
        vehicle_type: vType,
        total: 0,
        won: 0,
        lost: 0,
        pending: 0,
        totalBidAmount: 0,
        totalLostAtAmount: 0,
        lostWithPriceCount: 0
      };
    }

    const item = map[vType];
    item.total++;

    const status = (b.status || '').trim();
    const bidAmt = Number(b.bidding_amount || b.quoted_amount || 0);
    const lostAt = Number(b.bidding_lost_at || b.actual_winning_rate || 0);

    if (status === 'Won') item.won++;
    else if (status === 'Lost') {
      item.lost++;
      if (lostAt > 0) {
        item.totalLostAtAmount += lostAt;
        item.lostWithPriceCount++;
      }
    } else {
      item.pending++;
    }

    if (bidAmt > 0) item.totalBidAmount += bidAmt;
  });

  return Object.values(map).map(item => {
    const decisive = item.won + item.lost;
    const winRate = decisive > 0 ? Number(((item.won / decisive) * 100).toFixed(1)) : 0;
    const avgBid = item.total > 0 ? Math.round(item.totalBidAmount / item.total) : 0;
    const avgLostAt = item.lostWithPriceCount > 0 ? Math.round(item.totalLostAtAmount / item.lostWithPriceCount) : 0;
    const gap = (avgBid > 0 && avgLostAt > 0) ? avgBid - avgLostAt : 0;

    return {
      ...item,
      winRate,
      avgBid,
      avgLostAt,
      gap
    };
  }).sort((a, b) => b.total - a.total);
};

/**
 * Route & Corridor Performance
 */
export const getRouteCorridorAnalytics = (bids = []) => {
  const map = {};

  bids.forEach(b => {
    const start = (b.starting_point || b.origin || 'Origin').trim();
    const end = (b.ending_point || b.destination || 'Destination').trim();
    const key = `${start} ➔ ${end}`;

    if (!map[key]) {
      map[key] = {
        route: key,
        start,
        end,
        total: 0,
        won: 0,
        lost: 0,
        trip_detail: b.trip_detail || '1 Way',
        totalStops: 0,
        totalBidAmount: 0,
        prices: []
      };
    }

    const item = map[key];
    item.total++;
    item.totalStops += Number(b.no_of_stops || 1);

    const status = (b.status || '').trim();
    if (status === 'Won') item.won++;
    else if (status === 'Lost') item.lost++;

    const bidAmt = Number(b.bidding_amount || b.quoted_amount || 0);
    if (bidAmt > 0) {
      item.totalBidAmount += bidAmt;
      item.prices.push(bidAmt);
    }
  });

  return Object.values(map).map(item => {
    const decisive = item.won + item.lost;
    const winRate = decisive > 0 ? Number(((item.won / decisive) * 100).toFixed(1)) : 0;
    const avgBid = item.prices.length > 0 ? Math.round(item.totalBidAmount / item.prices.length) : 0;
    const minBid = item.prices.length > 0 ? Math.min(...item.prices) : 0;
    const maxBid = item.prices.length > 0 ? Math.max(...item.prices) : 0;
    const avgStops = item.total > 0 ? Number((item.totalStops / item.total).toFixed(1)) : 1;

    return {
      ...item,
      winRate,
      avgBid,
      minBid,
      maxBid,
      avgStops
    };
  }).sort((a, b) => b.total - a.total);
};

/**
 * Client Breakdown (Contract vs Spot)
 */
export const getClientBiddingAnalytics = (bids = []) => {
  const map = {};

  bids.forEach(b => {
    const client = (b.client_name || b.counterparty || 'General').trim();
    if (!map[client]) {
      map[client] = {
        client_name: client,
        total: 0,
        contractCount: 0,
        spotCount: 0,
        won: 0,
        lost: 0,
        totalQuoted: 0,
        totalWon: 0
      };
    }

    const item = map[client];
    item.total++;

    const isContract = (b.bidding_type || 'Contract').toLowerCase() === 'contract';
    if (isContract) item.contractCount++;
    else item.spotCount++;

    const status = (b.status || '').trim();
    const bidAmt = Number(b.bidding_amount || b.quoted_amount || 0);

    if (status === 'Won') {
      item.won++;
      item.totalWon += bidAmt;
    } else if (status === 'Lost') {
      item.lost++;
    }

    if (bidAmt > 0) item.totalQuoted += bidAmt;
  });

  return Object.values(map).map(item => {
    const decisive = item.won + item.lost;
    const winRate = decisive > 0 ? Number(((item.won / decisive) * 100).toFixed(1)) : 0;
    return {
      ...item,
      winRate
    };
  }).sort((a, b) => b.total - a.total);
};
