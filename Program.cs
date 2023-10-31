using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.MapPost("/calculate", async(HttpContext context) =>
{
    var request = context.Request;
    if (request.ContentType != null && request.ContentType.Contains("text/plain"))
    {
        using (var reader = new StreamReader(request.Body))
        {
            var inputData = await reader.ReadToEndAsync();

            if (inputData != null)
            {
                var result = JsonSerializer.Serialize(CalculateGrid(inputData));
                return result;
            }
        }
    }
    return "Invalid request";
});

app.Run();

List<Dictionary<string, bool>> CalculateGrid(string data)
{
    string[] lines = data.Split(Environment.NewLine.ToCharArray()).Where(s => !string.IsNullOrEmpty(s)).ToArray();
    int width = int.Parse(lines[0].Split(' ')[0]);
    int height = int.Parse(lines[0].Split(' ')[1]);

    List<int> lightsCoord = new List<int>();
    List<Dictionary<string, bool>> output = new List<Dictionary<string, bool>>();

    object[,][] grid = new object[height, width][];
    for (int i = 0; i < height; i++)
    {
        string[] line = lines[i + 1].Split(' ');
        line = line.Where(s => !string.IsNullOrWhiteSpace(s)).ToArray();
        for (int j = 0; j < width; j++)
        {
            grid[i, j] = new object[] { new object(), line[j].ToString() };
            if (line[j].ToString().Contains("Q"))
            {
                lightsCoord.Add(j);
            }
        }
    }
    for (int i = 0; i < (1 << lightsCoord.Count); i++)
    {
        string binary = Convert.ToString(i, 2).PadLeft(lightsCoord.Count, '0');

        for (int j = 0; j < lightsCoord.Count; j++)
        {
            char lightState = binary[j];
            grid[0, lightsCoord[j]][0] = lightState == '1';
        }
        output.Add(calculateEndState(grid, width, height));
    }
    return output;
}
bool[] white(bool left, bool right)
 {
     return new bool[2] { !(left && right), !(left && right) };
 }
 bool[] red(bool input)
 {
     return new bool[2] { !input, !input };
 }
 bool[] blue(bool left, bool right)
 {
     return new bool[2] { left, right };
 }

Dictionary<string, bool> calculateEndState(object[,][] grid, int width, int height)
{  
    Dictionary<string, bool> res = new Dictionary<string, bool>();
    for (int i = 0; i < height; i++)
    {
        for (int j = 0; j < width; j++)
        {
            switch (grid[i, j][1].ToString())
            {
                case "X":
                    grid[i, j][0] = false;
                    break;
                case string a when a.Contains("Q"):
                    res[a] = (bool)grid[i, j][0];
                    break;
                case "W":
                    if (grid[i, j + 1][1].ToString() == "W")
                    {
                        bool[] result = white((bool)grid[i - 1, j][0], (bool)grid[i - 1, j + 1][0]);
                        grid[i, j][0] = result[0];
                        grid[i, j + 1][0] = result[1];
                        j++;
                    }
                    break;
                case "R":
                    if (grid[i, j + 1][1].ToString() == "r")
                    {
                        bool[] result = red((bool)grid[i - 1, j][0]);
                        grid[i, j][0] = result[0];
                        grid[i, j + 1][0] = result[1];
                        j++;
                    }
                    break;
                case "r":
                    if (grid[i, j + 1][1].ToString() == "R")
                    {
                        bool[] result = red((bool)grid[i - 1, j + 1][0]);
                        grid[i, j][0] = result[0];
                        grid[i, j + 1][0] = result[1];
                        j++;
                    }
                    break;
                case "B":
                    if (grid[i, j + 1][1].ToString() == "B")
                    {
                        bool[] result = blue((bool)grid[i - 1, j][0], (bool)grid[i - 1, j + 1][0]);
                        grid[i, j][0] = result[0];
                        grid[i, j + 1][0] = result[1];
                        j++;
                    }
                    break;
                case string a when a.Contains("L"):
                    if(grid[i-1,j][1].ToString().Contains("L"))
                    {
                        grid[i,j][0]=false;
                    }
                    else
                    {
                        grid[i, j][0] = grid[i - 1, j][0];
                    }
                    res[a] = (bool)grid[i, j][0];
                    break;
            }
        }
    }
    return res;
}   