Feature: Join band by invite code

  Scenario: Join an existing band using invite code
    Given I am a logged-in user without a band
    When I enter the invite code "RC-99X-DEV"
    And I click on "Join band"
    Then I am added to the band members list
    And I see the band dashboard
