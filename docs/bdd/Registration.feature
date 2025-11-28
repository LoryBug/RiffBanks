Feature: User onboarding

  Scenario: Account creation and onboarding completion
    Given I am a new user on the registration page
    When I enter the name "Mario", email and password
    Then I am redirected to the onboarding wizard
    When I select an instrument
    And I select a genre
    Then my profile is saved
    And I access the empty dashboard