#!/usr/bin/env python3
"""
Risk Score Calculator for Sow Sure AI
Computes farmer loan applicant risk scores for banks using a penalty-based system.
"""

def compute_risk_score(applicant_data: dict) -> dict:
    """
    Compute the risk score for a loan applicant.
    Returns a dict with:
      - score (int)
      - classification (str: "Low Risk", "Medium Risk", "High Risk", "Very High Risk")
    """
    
    # Initialize penalty score
    penalty_score = 0
    
    # 1. CAPACITY TO PAY (Max 30 points)
    
    # Net Disposable Income Ratio (NDIR)
    income = applicant_data.get('income', 0)
    expenses = applicant_data.get('expenses', 0)
    loan_payments = applicant_data.get('loan_payments', 0)
    
    net_disposable_income = income - expenses - loan_payments
    ndir = (net_disposable_income / income) * 100 if income > 0 else 0
    
    if ndir >= 50:
        penalty_score += 0
    elif ndir >= 30:
        penalty_score += 5
    elif ndir >= 10:
        penalty_score += 10
    else:
        penalty_score += 15
    
    # Income Stability
    income_sources = applicant_data.get('income_sources', 'unstable')
    income_stability_penalties = {
        'multiple': 0,
        'farm_only_multi_harvest': 5,
        'farm_only_single_harvest': 10,
        'unstable': 15
    }
    penalty_score += income_stability_penalties.get(income_sources, 15)
    
    # Loan Repayment History
    loan_history = applicant_data.get('loan_history', 'default')
    loan_history_penalties = {
        'on_time': 0,
        'sometimes_late': 5,
        'default': 10
    }
    penalty_score += loan_history_penalties.get(loan_history, 10)
    
    # 2. CAPITAL STRENGTH (Max 20 points)
    
    # Land Ownership
    land_ownership = applicant_data.get('land_ownership', 'none')
    land_ownership_penalties = {
        'titled_1ha_plus': 0,
        'small_or_shared': 3,
        'tenant': 7,
        'none': 10
    }
    penalty_score += land_ownership_penalties.get(land_ownership, 10)
    
    # Equipment + Savings
    equipment_savings = applicant_data.get('equipment_savings', 0)
    if equipment_savings >= 100000:
        penalty_score += 0
    elif equipment_savings >= 50000:
        penalty_score += 3
    elif equipment_savings > 0:
        penalty_score += 7
    else:
        penalty_score += 10
    
    # Crops in Storage
    crops_storage = applicant_data.get('crops_storage', 0)
    if crops_storage >= 50000:
        penalty_score += 0
    elif crops_storage >= 20000:
        penalty_score += 3
    elif crops_storage > 0:
        penalty_score += 7
    else:
        penalty_score += 10
    
    # 3. COLLATERAL & PROTECTION (Max 15 points)
    
    # Collateral Ratio
    collateral_ratio = applicant_data.get('collateral_ratio', 0)
    if collateral_ratio >= 1.0:
        penalty_score += 0
    elif collateral_ratio >= 0.5:
        penalty_score += 5
    elif collateral_ratio > 0:
        penalty_score += 10
    else:
        penalty_score += 15
    
    # Insurance
    insurance = applicant_data.get('insurance', 'none')
    insurance_penalties = {
        'crop_life': 0,
        'crop_only': 5,
        'none': 10
    }
    penalty_score += insurance_penalties.get(insurance, 10)
    
    # 4. CHARACTER & CREDITWORTHINESS (Max 10 points)
    
    # Banking History
    banking_history = applicant_data.get('banking_history', 'none')
    banking_penalties = {
        'savings_and_good_loans': 0,
        'savings_only': 3,
        'none': 5
    }
    penalty_score += banking_penalties.get(banking_history, 5)
    
    # Coop Membership
    coop_member = applicant_data.get('coop_member', False)
    penalty_score += 0 if coop_member else 5
    
    # 5. HAZARD SUSCEPTIBILITY (Max 25 points)
    
    hazards = applicant_data.get('hazards', {})
    hazard_penalties = {
        'low': 0,
        'moderate': 5,
        'high': 10
    }
    
    # Process each hazard type
    for hazard_type in ['seismic', 'flood_typhoon', 'other']:
        hazard_level = hazards.get(hazard_type, 'high')  # Default to high risk if not specified
        penalty_score += hazard_penalties.get(hazard_level, 10)
    
    # Determine risk classification
    if penalty_score <= 20:
        classification = "Low Risk"
    elif penalty_score <= 40:
        classification = "Medium Risk"
    elif penalty_score <= 60:
        classification = "High Risk"
    else:
        classification = "Very High Risk"
    
    return {
        'score': penalty_score,
        'classification': classification
    }


# Example usage and test function
def test_risk_score():
    """Test the risk score function with sample data"""
    
    # Low risk applicant
    low_risk_applicant = {
        'income': 500000,
        'expenses': 200000,
        'loan_payments': 50000,
        'income_sources': 'multiple',
        'loan_history': 'on_time',
        'land_ownership': 'titled_1ha_plus',
        'equipment_savings': 150000,
        'crops_storage': 75000,
        'collateral_ratio': 1.2,
        'insurance': 'crop_life',
        'banking_history': 'savings_and_good_loans',
        'coop_member': True,
        'hazards': {
            'seismic': 'low',
            'flood_typhoon': 'low',
            'other': 'low'
        }
    }
    
    # High risk applicant
    high_risk_applicant = {
        'income': 100000,
        'expenses': 80000,
        'loan_payments': 30000,
        'income_sources': 'unstable',
        'loan_history': 'default',
        'land_ownership': 'none',
        'equipment_savings': 0,
        'crops_storage': 0,
        'collateral_ratio': 0,
        'insurance': 'none',
        'banking_history': 'none',
        'coop_member': False,
        'hazards': {
            'seismic': 'high',
            'flood_typhoon': 'high',
            'other': 'high'
        }
    }
    
    print("Low Risk Applicant:")
    result_low = compute_risk_score(low_risk_applicant)
    print(f"Score: {result_low['score']}, Classification: {result_low['classification']}")
    
    print("\nHigh Risk Applicant:")
    result_high = compute_risk_score(high_risk_applicant)
    print(f"Score: {result_high['score']}, Classification: {result_high['classification']}")


if __name__ == "__main__":
    test_risk_score()
