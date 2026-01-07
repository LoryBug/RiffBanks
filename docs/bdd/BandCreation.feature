Feature: Band management

  Scenario: Creating a new band
    Given I am a logged-in user without a band
    When I click on "Create New Band"
    And I enter the name and the genre
    Then a new band is created
    And I am assigned the role "Admin"
    And a unique invite code is generated
