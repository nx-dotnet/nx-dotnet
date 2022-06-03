namespace NxDotnet.Test.Webapi;

public class WeatherForecast
{
  public DateTime Date { get; set; }

  public Temperature? Temperature { get; set; }

  public string? Summary { get; set; }

  public Person? Forecaster { get; set; }
}

public class Temperature
{
  public int TemperatureC { get; set; }

  public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

public class Person
{
  public Company? Employer { get; set; }
}

public class Company
{
  public List<Person>? Employees { get; set; }
}