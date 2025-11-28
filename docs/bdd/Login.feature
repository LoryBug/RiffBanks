Feature: User authentication

  Scenario: User logs in successfully
    Given I am on the login page
    When I enter a valid email and password
    And I click on "Login"
    Then I am authenticated
    And I am redirected to the bands dashboard